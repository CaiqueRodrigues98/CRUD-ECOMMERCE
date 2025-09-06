import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

// Enum para os possíveis status do pedido
export enum OrderStatus {
  PENDING = 'pendente',
  PROCESSING = 'processando',
  SHIPPED = 'enviado',
  DELIVERED = 'entregue',
  CANCELED = 'cancelado',
}

// Entidade Order representando a tabela 'orders' no banco de dados
@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('jsonb')
  items: { productId: string; quantity: number; price?: number }[];

  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.PENDING })
  status: OrderStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
