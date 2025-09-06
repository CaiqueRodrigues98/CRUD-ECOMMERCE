import { Test, TestingModule } from '@nestjs/testing';
import { OrdersController } from '../src/orders/orders.controller';
import { OrdersService } from '../src/orders/orders.service';
import { CreateOrderDto } from '../src/orders/dto/create-order.dto';
import { UpdateOrderDto } from '../src/orders/dto/update-order.dto';

describe('OrdersController', () => {
  let ordersController: OrdersController;
  let ordersService: OrdersService;

  const mockOrderService = {
    create: jest.fn((dto: CreateOrderDto) => {
      return { id: Date.now(), ...dto };
    }),
    findAll: jest.fn(() => {
      return [];
    }),
    findOne: jest.fn((id: number) => {
      return { id, items: [], status: 'pending', createdAt: new Date(), updatedAt: new Date() };
    }),
    update: jest.fn((id: number, dto: UpdateOrderDto) => {
      return { id, ...dto };
    }),
    remove: jest.fn((id: number) => {
      return { id };
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrdersController],
      providers: [
        {
          provide: OrdersService,
          useValue: mockOrderService,
        },
      ],
    }).compile();

    ordersController = module.get<OrdersController>(OrdersController);
    ordersService = module.get<OrdersService>(OrdersService);
  });

  it('should be defined', () => {
    expect(ordersController).toBeDefined();
  });

  describe('create', () => {
    it('should create a new order', async () => {
      const createOrderDto: CreateOrderDto = { items: [{ productId: 1, quantity: 2 }], status: 'pending' };
      expect(await ordersController.create(createOrderDto)).toEqual({
        id: expect.any(Number),
        ...createOrderDto,
      });
      expect(ordersService.create).toHaveBeenCalledWith(createOrderDto);
    });
  });

  describe('findAll', () => {
    it('should return an array of orders', async () => {
      expect(await ordersController.findAll()).toEqual([]);
      expect(ordersService.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a single order', async () => {
      const id = 1;
      expect(await ordersController.findOne(id)).toEqual({
        id,
        items: [],
        status: 'pending',
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
      expect(ordersService.findOne).toHaveBeenCalledWith(id);
    });
  });

  describe('update', () => {
    it('should update an order', async () => {
      const id = 1;
      const updateOrderDto: UpdateOrderDto = { status: 'shipped' };
      expect(await ordersController.update(id, updateOrderDto)).toEqual({
        id,
        ...updateOrderDto,
      });
      expect(ordersService.update).toHaveBeenCalledWith(id, updateOrderDto);
    });
  });

  describe('remove', () => {
    it('should remove an order', async () => {
      const id = 1;
      expect(await ordersController.remove(id)).toEqual({ id });
      expect(ordersService.remove).toHaveBeenCalledWith(id);
    });
  });
});