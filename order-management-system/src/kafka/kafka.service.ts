import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { Kafka, Producer } from 'kafkajs';
import { join } from 'path';
import { promises as fsp } from 'fs';
import * as fs from 'fs';

@Injectable() // Serviço para interagir com Kafka
export class KafkaService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(KafkaService.name);
  private kafka: Kafka;
  private producer: Producer;
  private brokers: string[];
  private producerConnected = false;
  private messagesQueue: Array<{ topic: string; payload: any }> = [];
  private reconnectDelay = 1000; // ms
  private reconnecting = false;
  private queueFilePath: string;
  private queueLogPath: string;
  // milissegundos a aguardar por um producer.send antes de considerá-lo como falha
  private sendTimeoutMs = 5000;

  constructor() {
    this.brokers = [process.env.KAFKA_BROKER || 'localhost:9092'];
    this.kafka = new Kafka({
      clientId: 'orders-app',
      brokers: this.brokers,
    });
    this.producer = this.kafka.producer();

    // DETECTA PASTA CORRETA PARA ARMAZENAR A FILA (robusto entre builds e bind-mounts)
    const possibleSubdir = join(process.cwd(), 'order-management-system');
    const baseDir = fs.existsSync(possibleSubdir)
      ? possibleSubdir
      : process.cwd();
    const dataDir = join(baseDir, 'data');

    this.queueFilePath = join(dataDir, 'kafka-queue.json');
    this.queueLogPath = join(dataDir, 'kafka-queue.log');
  }

  async onModuleInit() {
    // Garante que a pasta de fila exista e carrega mensagens persistidas
    await this.ensureQueueStorage();
    await this.loadQueueFromDisk().catch((e) =>
      this.logger.warn(`Failed to load persisted Kafka queue: ${e}`),
    );
    // Inicia tentativas de conexão em background mas não deixa a aplicação cair se o Kafka estiver indisponível.
    this.connectWithRetry();
  }

  async onModuleDestroy() {
    try {
      if (this.producerConnected) {
        await this.producer.disconnect();
        this.producerConnected = false;
      }
    } catch (err) {
      this.logger.warn(`Error while disconnecting producer: ${err}`);
    }
  }

  private async connectWithRetry(): Promise<void> {
    if (this.reconnecting) return;
    this.reconnecting = true;
    while (!this.producerConnected) {
      try {
        this.logger.log(
          `Attempting to connect to Kafka broker(s): ${JSON.stringify(this.brokers)}`,
        );
        await this.producer.connect();
        this.producerConnected = true;
        this.logger.log('Connected to Kafka broker');
        // esvazia mensagens enfileiradas
        await this.flushQueue();
        this.reconnectDelay = 1000; // reseta delay após sucesso
      } catch (err) {
        this.producerConnected = false;
        this.logger.warn(
          `Failed to connect to Kafka broker (will retry): ${err}`,
        );
        // backoff exponencial com teto
        await new Promise((res) => setTimeout(res, this.reconnectDelay));
        this.reconnectDelay = Math.min(this.reconnectDelay * 2, 30000);
      }
    }
    this.reconnecting = false;
  }

  private async flushQueue() {
    if (!this.producerConnected || this.messagesQueue.length === 0) return;
    this.logger.log(
      `Flushing ${this.messagesQueue.length} queued Kafka messages`,
    );
    const queue = this.messagesQueue.splice(0, this.messagesQueue.length);
    for (const item of queue) {
      try {
        await this.producer.send({
          topic: item.topic,
          messages: [{ value: JSON.stringify(item.payload) }],
        });
        // remover da persistência em disco se presente (faremos snapshot após flush completo)
      } catch (err) {
        this.logger.error(
          `Failed to send queued message to topic ${item.topic}: ${err}`,
        );
        // re-enfileira em memória e persiste
        this.messagesQueue.push(item);
        await this.persistQueueToDisk().catch(() => {});
      }
    }
    // Compacta o log após tentar enviar todas as mensagens enfileiradas
    await this.compactQueueLog().catch((e) =>
      this.logger.warn(`Failed to compact queue log: ${e}`),
    );
  }

  async sendMessage(topic: string, payload: any) {
    this.logger.debug(
      `sendMessage called for topic=${topic}, producerConnected=${this.producerConnected}`,
    );
    if (!this.producerConnected) {
      // Enfileira a mensagem e garante que as tentativas de reconexão em background estejam rodando
      this.logger.warn(
        `Kafka producer not connected, queueing message for topic ${topic}`,
      );
      const msg = { topic, payload };
      this.messagesQueue.push(msg);
      try {
        this.appendMessageToLogSync(msg);
      } catch (e) {
        this.logger.warn(`Failed to append queued message to log (sync): ${e}`);
        // fallback para append assíncrono
        await this.appendMessageToLog(msg).catch((err) =>
          this.logger.warn(`Failed to append queued message to log: ${err}`),
        );
      }
      // inicia tentativas de reconexão se ainda não estiver rodando
      this.connectWithRetry().catch((err) =>
        this.logger.error(`Reconnect error: ${err}`),
      );
      return;
    }

    try {
      await this.sendWithTimeout({ topic, payload }, this.sendTimeoutMs);
    } catch (err) {
      this.logger.error(
        `Error sending message to Kafka topic ${topic}: ${err}`,
      );
      // em caso de falha, enfileira a mensagem e tenta reconectar
      const msg = { topic, payload };
      this.messagesQueue.push(msg);
      this.logger.log(
        `Queued message in memory for topic ${topic}. Queue length=${this.messagesQueue.length}`,
      );
      try {
        await this.appendMessageToLog(msg);
        this.logger.log(`Appended message to queue log for topic ${topic}`);
      } catch (e) {
        this.logger.warn(
          `Failed to append queued message after send error: ${e}`,
        );
      }
      this.producerConnected = false;
      this.connectWithRetry().catch((e) =>
        this.logger.error(`Reconnect error: ${e}`),
      );
    }
  }

  private async sendWithTimeout(
    item: { topic: string; payload: any },
    timeoutMs: number,
  ) {
    const sendPromise = this.producer.send({
      topic: item.topic,
      messages: [{ value: JSON.stringify(item.payload) }],
    });

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('kafka-send-timeout')), timeoutMs),
    );

    return Promise.race([sendPromise, timeoutPromise]);
  }

  // helpers de persistência
  private async ensureQueueStorage() {
    try {
      const dir = join(process.cwd(), 'data');
      await fsp.mkdir(dir, { recursive: true });
      // garante que o arquivo exista
      await fsp.writeFile(this.queueFilePath, '[]', { flag: 'a' });
      await fsp.writeFile(this.queueLogPath, '', { flag: 'a' });
    } catch (e) {
      this.logger.warn(`Could not ensure queue storage: ${e}`);
    }
  }

  private async loadQueueFromDisk() {
    try {
      try {
        const content = await fsp.readFile(this.queueFilePath, 'utf8');
        const arr = JSON.parse(content || '[]');
        if (Array.isArray(arr) && arr.length) {
          this.messagesQueue.push(...arr);
          this.logger.log(`Loaded ${arr.length} messages from persisted queue`);
        }
      } catch (e) {
        // ignorar
      }
      // Em seguida, carrega o log append-only
      try {
        const log = await fsp.readFile(this.queueLogPath, 'utf8');
        if (log) {
          const lines = log.split(/\r?\n/).filter((l) => l.trim().length > 0);
          for (const line of lines) {
            try {
              const obj = JSON.parse(line);
              this.messagesQueue.push(obj);
            } catch (e) {
              // ignora linha malformada
            }
          }
          if (lines.length)
            this.logger.log(`Loaded ${lines.length} messages from queue log`);
        }
      } catch (e) {
        // ignorar
      }
    } catch (e) {
      // ignorar erros de parsing
    }
  }

  private async persistQueueToDisk() {
    try {
      // grava snapshot da fila atual em arquivo JSON
      await fsp.writeFile(
        this.queueFilePath,
        JSON.stringify(this.messagesQueue, null, 2),
      );
    } catch (e) {
      this.logger.warn(`Failed to persist queue to disk: ${e}`);
    }
  }

  private async removePersistedMessage(msg: { topic: string; payload: any }) {
    try {
      const content = await fsp.readFile(this.queueFilePath, 'utf8');
      const arr = JSON.parse(content || '[]');
      const idx = arr.findIndex(
        (m: any) => JSON.stringify(m) === JSON.stringify(msg),
      );
      if (idx >= 0) {
        arr.splice(idx, 1);
        await fsp.writeFile(this.queueFilePath, JSON.stringify(arr, null, 2));
      }
    } catch (e) {
      // não-fatal
    }
  }

  // helpers de append-only
  private async appendMessageToLog(msg: { topic: string; payload: any }) {
    try {
      const line = JSON.stringify(msg) + '\n';
      await fsp.appendFile(this.queueLogPath, line, { encoding: 'utf8' });
      this.logger.debug(
        `appendMessageToLog: wrote 1 line to ${this.queueLogPath}`,
      );
    } catch (e) {
      this.logger.warn(`Failed to append to queue log: ${e}`);
    }
  }

  // append síncrono usado para garantir persistência em cenários fire-and-forget
  private appendMessageToLogSync(msg: { topic: string; payload: any }) {
    try {
      const line = JSON.stringify(msg) + '\n';
      fs.appendFileSync(this.queueLogPath, line, { encoding: 'utf8' });
      this.logger.debug(
        `appendMessageToLogSync: wrote 1 line to ${this.queueLogPath}`,
      );
    } catch (e) {
      throw e;
    }
  }

  private async compactQueueLog() {
    try {
      // grava snapshot da fila atual em JSON e trunca o log
      await fsp.writeFile(
        this.queueFilePath,
        JSON.stringify(this.messagesQueue, null, 2),
      );
      await fsp.writeFile(this.queueLogPath, '');
    } catch (e) {
      this.logger.warn(`Failed to compact queue log: ${e}`);
    }
  }
}
