import { PartialType, ApiPropertyOptional } from '@nestjs/swagger';
import { CreateOrderDto } from './create-order.dto';
import type { OrderStatus } from '../entities/order.entity';

export class UpdateOrderDto extends PartialType(CreateOrderDto) {
  @ApiPropertyOptional({
    // Status do pedido
    example: 'processando',
    enum: ['pendente', 'processando', 'enviado', 'entregue', 'cancelado'],
  })
  status?: OrderStatus = undefined;
}
