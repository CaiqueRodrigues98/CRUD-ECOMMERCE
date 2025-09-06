import { Injectable } from '@nestjs/common';
import { OrdersRepository } from './orders.repository';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Order } from './entities/order.entity';
import { KafkaService } from '../kafka/kafka.service';
import { ElasticsearchService } from '../elasticsearch/elasticsearch.service';

@Injectable()
export class OrdersService {
  constructor(
    private readonly ordersRepository: OrdersRepository,
    private readonly kafkaService: KafkaService,
    private readonly elasticsearchService: ElasticsearchService,
  ) {}

  async createOrder(data: CreateOrderDto): Promise<Order> {
    const order = this.ordersRepository.create(data);
    await this.ordersRepository.save(order);

    // Kafka (fire-and-forget: do not block request on Kafka availability)
    this.kafkaService.sendMessage('order_created', order).catch((e) => {
      // errors are already handled inside KafkaService, but keep safe catch
      // no-op here to avoid unhandled rejection
    });

    // Elasticsearch
    await this.elasticsearchService.indexOrder(order);

    return order;
  }

  async updateOrder(id: string, data: UpdateOrderDto): Promise<Order> {
    const order = await this.ordersRepository.findById(id);
    if (!order) throw new Error('Order not found');

    Object.assign(order, data);
    await this.ordersRepository.save(order);

    // Kafka
    if (data.status) {
      this.kafkaService
        .sendMessage('order_status_updated', {
          id: order.id,
          status: order.status,
        })
        .catch(() => {});
    }

    // Elasticsearch
    await this.elasticsearchService.updateOrder(order);

    return order;
  }

  async getOrder(id: string): Promise<Order | null> {
    return this.ordersRepository.findById(id);
  }

  async getAllOrders(): Promise<Order[]> {
    return this.ordersRepository.find();
  }

  async deleteOrder(id: string) {
    const order = await this.ordersRepository.findById(id);
    if (!order) throw new Error('Order not found');
    await this.ordersRepository.remove(order);
    return { deleted: true };
  }

  // Busca avançada usando Elasticsearch
  async searchOrders(filters: any) {
    return this.elasticsearchService.searchOrders(filters);
  }
}
