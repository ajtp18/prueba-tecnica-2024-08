import { Test, TestingModule } from '@nestjs/testing';
import { TransactionService } from '../../transaction/transaction.service';
import { TypeOrmTransactionRepository } from '../../../infrastructure/repositories/typeorm-transaction.repository';
import { TypeOrmProductRepository } from '../../../infrastructure/repositories/typeorm-product.repository';
import { TypeOrmCustomerRepository } from '../../../infrastructure/repositories/typeorm-customer.repository';
import { WompiService } from '../../transaction/wompi.service';
import { ConfigService } from '@nestjs/config';
import { Transaction } from '../../../core/entities/transactions/transaction.entity';
import { Product } from '../../../core/entities/products/product.entity';
import { Customer } from '../../../core/entities/customers/customer.entity';

describe('TransactionService', () => {
  let service: TransactionService;
  let transactionRepository: TypeOrmTransactionRepository;
  let productRepository: TypeOrmProductRepository;
  let customerRepository: TypeOrmCustomerRepository;
  let wompiService: WompiService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionService,
        {
          provide: TypeOrmTransactionRepository,
          useValue: {
            create: jest.fn(),
            findById: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: TypeOrmProductRepository,
          useValue: {
            findById: jest.fn(),
            updateStock: jest.fn(),
          },
        },
        {
          provide: TypeOrmCustomerRepository,
          useValue: {
            findById: jest.fn(),
          },
        },
        {
          provide: WompiService,
          useValue: {
            createTransaction: jest.fn(),
            getTransactionStatus: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'WOMPI_REFERENCE_PREFIX') {
                return 'WOMPITEST';
              }
              return null;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<TransactionService>(TransactionService);
    transactionRepository = module.get<TypeOrmTransactionRepository>(TypeOrmTransactionRepository);
    productRepository = module.get<TypeOrmProductRepository>(TypeOrmProductRepository);
    customerRepository = module.get<TypeOrmCustomerRepository>(TypeOrmCustomerRepository);
    wompiService = module.get<WompiService>(WompiService);
    configService = module.get<ConfigService>(ConfigService);
  });

  describe('create', () => {
    it('should create a transaction and update stock', async () => {
      const product = new Product();
      product.id = 1;
      product.stock = 10;
      product.price = 100;

      const customer = new Customer();
      customer.id = 1;
      customer.cards = { 0: 'mockCardToken' };

      const transaction = new Transaction();
      transaction.id = 1;
      transaction.status = 'PENDING';

      jest.spyOn(productRepository, 'findById').mockResolvedValue(product);
      jest.spyOn(productRepository, 'updateStock').mockResolvedValue(null);
      jest.spyOn(customerRepository, 'findById').mockResolvedValue(customer);
      jest.spyOn(transactionRepository, 'create').mockResolvedValue(transaction);
      jest.spyOn(wompiService, 'createTransaction').mockResolvedValue({
        data: { data: { id: 'wompiTransactionId', status: 'OK' } } as any,
      });

      const result = await service.create(1, 1, 0);

      expect(productRepository.findById).toHaveBeenCalledWith(1);
      expect(productRepository.updateStock).toHaveBeenCalledWith(1, 9);
      expect(customerRepository.findById).toHaveBeenCalledWith(1);
      expect(transactionRepository.create).toHaveBeenCalled();
      expect(wompiService.createTransaction).toHaveBeenCalled();
      expect(result.status).toBe('OK');
      expect(result.paymentId).toBe('wompiTransactionId');
    });

    it('should throw an error if product is out of stock', async () => {
      const product = new Product();
      product.id = 1;
      product.stock = 0;

      jest.spyOn(productRepository, 'findById').mockResolvedValue(product);

      await expect(service.create(1, 1, 0)).rejects.toThrow(`The producto #${product.id} is out of stock, try again later`);
    });

    it('should throw an error if card index is invalid', async () => {
      const product = new Product();
      product.id = 1;
      product.stock = 10;

      const customer = new Customer();
      customer.id = 1;
      customer.cards = {};

      jest.spyOn(productRepository, 'findById').mockResolvedValue(product);
      jest.spyOn(customerRepository, 'findById').mockResolvedValue(customer);

      await expect(service.create(1, 1, 0)).rejects.toThrow('The referenced card is disabled or not exists');
    });
  });

  describe('findById', () => {
    it('should return a transaction and update its status', async () => {
      const transaction = new Transaction();
      transaction.id = 1;
      transaction.status = 'PENDING';
      transaction.paymentId = 'wompiTransactionId';

      jest.spyOn(transactionRepository, 'findById').mockResolvedValue(transaction);
      jest.spyOn(wompiService, 'getTransactionStatus').mockResolvedValue('OK');

      const result = await service.findById(1);

      expect(transactionRepository.findById).toHaveBeenCalledWith(1);
      expect(wompiService.getTransactionStatus).toHaveBeenCalledWith('wompiTransactionId');
      expect(transactionRepository.update).toHaveBeenCalledWith(expect.objectContaining({ status: 'OK' }));
      expect(result.status).toBe('OK');
    });
  });
});
