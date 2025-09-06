import { Test, TestingModule } from '@nestjs/testing';
import { OrdersService } from '../src/orders/orders.service';
import { OrdersRepository } from '../src/orders/orders.repository';
import { CreateOrderDto } from '../src/orders/dto/create-order.dto';
import { UpdateOrderDto } from '../src/orders/dto/update-order.dto';

describe('OrdersService', () => {
  let service: OrdersService;
  let repository: OrdersRepository;

  const mockOrderRepository = {
    create: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: OrdersRepository, useValue: mockOrderRepository },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
    repository = module.get<OrdersRepository>(OrdersRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new order', async () => {
      const createOrderDto: CreateOrderDto = {
        items: [{ productId: 1, quantity: 2 }],
        status: 'pending',
      };

      mockOrderRepository.create.mockReturnValue(createOrderDto);
      mockOrderRepository.save.mockResolvedValue(createOrderDto);

      const result = await service.create(createOrderDto);
      expect(result).toEqual(createOrderDto);
      expect(mockOrderRepository.create).toHaveBeenCalledWith(createOrderDto);
      expect(mockOrderRepository.save).toHaveBeenCalledWith(createOrderDto);
    });
  });

  describe('findAll', () => {
    it('should return an array of orders', async () => {
      const result = [{ id: 1, items: [], status: 'pending' }];
      mockOrderRepository.find.mockResolvedValue(result);

      expect(await service.findAll()).toBe(result);
    });
  });

  describe('findOne', () => {
    it('should return a single order', async () => {
      const result = { id: 1, items: [], status: 'pending' };
      mockOrderRepository.findOne.mockResolvedValue(result);

      expect(await service.findOne(1)).toBe(result);
    });
  });

  describe('update', () => {
    it('should update an order', async () => {
      const updateOrderDto: UpdateOrderDto = { status: 'shipped' };
      const existingOrder = { id: 1, items: [], status: 'pending' };
      const updatedOrder = { ...existingOrder, ...updateOrderDto };

      mockOrderRepository.findOne.mockResolvedValue(existingOrder);
      mockOrderRepository.save.mockResolvedValue(updatedOrder);

      expect(await service.update(1, updateOrderDto)).toBe(updatedOrder);
    });
  });

  describe('remove', () => {
    it('should remove an order', async () => {
      const existingOrder = { id: 1, items: [], status: 'pending' };
      mockOrderRepository.findOne.mockResolvedValue(existingOrder);
      mockOrderRepository.remove.mockResolvedValue(existingOrder);

      expect(await service.remove(1)).toBe(existingOrder);
    });
  });
});