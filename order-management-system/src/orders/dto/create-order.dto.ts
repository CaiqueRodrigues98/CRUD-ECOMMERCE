import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import type { OrderStatus } from '../entities/order.entity';

// DTO para itens do pedido
class OrderItemDto {
  @ApiProperty({ example: '12345' })
  @IsNotEmpty()
  productId: string = '';

  @ApiProperty({ example: 2 })
  @IsNotEmpty()
  quantity: number = 0;

  @ApiProperty({ example: 99.9 })
  @IsNotEmpty()
  price: number = 0;
}

export class CreateOrderDto {
  @ApiProperty({ type: [OrderItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[] = [];

  // Status do pedido
  @ApiProperty({
    example: 'pendente',
    enum: ['pendente', 'processando', 'enviado', 'entregue', 'cancelado'],
    required: false,
  })
  @IsOptional()
  @IsEnum(['pendente', 'processando', 'enviado', 'entregue', 'cancelado'])
  status?: OrderStatus;
}
