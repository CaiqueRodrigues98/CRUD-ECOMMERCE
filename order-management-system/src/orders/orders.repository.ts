import { Repository, DataSource } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { Order } from './entities/order.entity';

// Repositório personalizado para a entidade Order
@Injectable()
export class OrdersRepository extends Repository<Order> {
  constructor(private dataSource: DataSource) {
    super(Order, dataSource.createEntityManager());
  }

  findById(id: string) {
    return this.findOne({ where: { id } });
  }
}
