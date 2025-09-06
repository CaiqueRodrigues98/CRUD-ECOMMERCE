import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  NotFoundException,
  Query,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Order } from './entities/order.entity';

// Controlador para gerenciar endpoints relacionados a pedidos
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  create(@Body() data: CreateOrderDto): Promise<Order> {
    return this.ordersService.createOrder(data);
  }

  @Get()
  findAll(): Promise<Order[]> {
    return this.ordersService.getAllOrders();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Order> {
    const order = await this.ordersService.getOrder(id);
    if (!order) {
      throw new NotFoundException(`Order with id ${id} not found`);
    }
    return order;
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() data: UpdateOrderDto,
  ): Promise<Order> {
    return this.ordersService.updateOrder(id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ordersService.deleteOrder(id);
  }

  // Busca avançada usando Elasticsearch
  @Get('search')
  async search(
    @Query('term') term?: string,
    @Query('status') status?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('item') item?: string,
  ) {
    // Monta objeto de filtros
    const filters: any = { term, status, startDate, endDate, item };
    return this.ordersService.searchOrders(filters);
  }
}
