import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { Kafka, Producer, Partitioners } from 'kafkajs';
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
  // milliseconds to wait for a producer.send before treating it as failed
  private sendTimeoutMs = 5000;

  constructor() {
    this.brokers = [process.env.KAFKA_BROKER || 'localhost:9092'];
    this.kafka = new Kafka({
      clientId: 'orders-app',
      brokers: this.brokers,
      // keep legacy partitioner to avoid partitioning warnings if needed
      // createPartitioner: Partitioners.LegacyPartitioner,
    });
    this.producer = this.kafka.producer();
    this.queueFilePath = join(process.cwd(), 'data', 'kafka-queue.json');
    this.queueLogPath = join(process.cwd(), 'data', 'kafka-queue.log');
  }

  async onModuleInit() {
    // Ensure queue folder exists and load persisted messages, then start background connect attempts.
    await this.ensureQueueStorage();
    await this.loadQueueFromDisk().catch((e) =>
      this.logger.warn(`Failed to load persisted Kafka queue: ${e}`),
    );
    // Start background connect attempts but don't crash the app if Kafka is unavailable.
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
        // flush queued messages
        await this.flushQueue();
        this.reconnectDelay = 1000; // reset delay after success
      } catch (err) {
        this.producerConnected = false;
        this.logger.warn(
          `Failed to connect to Kafka broker (will retry): ${err}`,
        );
        // exponential backoff with cap
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
        // remove from disk persistence if present (we'll snapshot after successful flush)
        // no-op here; after full flush we'll compact the log
      } catch (err) {
        this.logger.error(
          `Failed to send queued message to topic ${item.topic}: ${err}`,
        );
        // re-queue to memory and persist
        this.messagesQueue.push(item);
        await this.persistQueueToDisk().catch(() => {});
      }
    }
    // Compact log after attempting to flush all queued messages
    await this.compactQueueLog().catch((e) =>
      this.logger.warn(`Failed to compact queue log: ${e}`),
    );
  }

  async sendMessage(topic: string, payload: any) {
    this.logger.debug(
      `sendMessage called for topic=${topic}, producerConnected=${this.producerConnected}`,
    );
    if (!this.producerConnected) {
      // Queue the message and ensure background reconnection is running
      this.logger.warn(
        `Kafka producer not connected, queueing message for topic ${topic}`,
      );
      const msg = { topic, payload };
      this.messagesQueue.push(msg);
      try {
        // Use synchronous append here so the write happens immediately even if
        // the caller does not await this async function (fire-and-forget).
        this.appendMessageToLogSync(msg);
      } catch (e) {
        this.logger.warn(`Failed to append queued message to log (sync): ${e}`);
        // fallback to async append
        await this.appendMessageToLog(msg).catch((err) =>
          this.logger.warn(`Failed to append queued message to log: ${err}`),
        );
      }
      // start reconnect attempts if not already running
      this.connectWithRetry().catch((err) =>
        this.logger.error(`Reconnect error: ${err}`),
      );
      return;
    }

    try {
      // use a send helper with timeout to avoid hanging when broker becomes unreachable
      await this.sendWithTimeout({ topic, payload }, this.sendTimeoutMs);
    } catch (err) {
      this.logger.error(
        `Error sending message to Kafka topic ${topic}: ${err}`,
      );
      // on failure, queue the message and try to reconnect
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

  // persistence helpers
  private async ensureQueueStorage() {
    try {
      const dir = join(process.cwd(), 'data');
      await fs.mkdir(dir, { recursive: true });
      // ensure file exists
      await fsp.writeFile(this.queueFilePath, '[]', { flag: 'a' });
      await fsp.writeFile(this.queueLogPath, '', { flag: 'a' });
    } catch (e) {
      this.logger.warn(`Could not ensure queue storage: ${e}`);
    }
  }

  private async loadQueueFromDisk() {
    try {
      // First, load snapshot JSON if present
      try {
        const content = await fsp.readFile(this.queueFilePath, 'utf8');
        const arr = JSON.parse(content || '[]');
        if (Array.isArray(arr) && arr.length) {
          this.messagesQueue.push(...arr);
          this.logger.log(`Loaded ${arr.length} messages from persisted queue`);
        }
      } catch (e) {
        // ignore
      }
      // Then, load append-only log (one JSON per line)
      try {
        const log = await fsp.readFile(this.queueLogPath, 'utf8');
        if (log) {
          const lines = log.split(/\r?\n/).filter((l) => l.trim().length > 0);
          for (const line of lines) {
            try {
              const obj = JSON.parse(line);
              this.messagesQueue.push(obj);
            } catch (e) {
              // ignore malformed line
            }
          }
          if (lines.length)
            this.logger.log(`Loaded ${lines.length} messages from queue log`);
        }
      } catch (e) {
        // ignore
      }
    } catch (e) {
      // ignore parsing errors
    }
  }

  private async persistQueueToDisk() {
    try {
      // snapshot current queue to JSON file
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
        await fs.writeFile(this.queueFilePath, JSON.stringify(arr, null, 2));
      }
    } catch (e) {
      // non-fatal
    }
  }

  // append-only helpers
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

  // synchronous append used to guarantee persistence in fire-and-forget scenarios
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
      // snapshot current memory queue to json and truncate log
      await fs.writeFile(
        this.queueFilePath,
        JSON.stringify(this.messagesQueue, null, 2),
      );
      await fs.writeFile(this.queueLogPath, '');
    } catch (e) {
      this.logger.warn(`Failed to compact queue log: ${e}`);
    }
  }
}
