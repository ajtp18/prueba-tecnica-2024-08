import { Test, TestingModule } from '@nestjs/testing';
import { TransactionController } from '../transaction.controller';
import { TransactionService } from '../transaction.service';
import { TypeOrmTransactionRepository } from '../../../infrastructure/repositories/typeorm-transaction.repository';
import { Transaction } from '../../../core/entities/transactions/transaction.entity';
import { WompiService } from '../wompi.service';
import { TransactionCreationError } from '../transactions.exceptions';
import { AxiosResponse, InternalAxiosRequestConfig } from 'axios';

describe('TransactionService', () => {
  let transactionService: TransactionService;
  let transactionRepository: jest.Mocked<TypeOrmTransactionRepository>;
  let wompiService: jest.Mocked<WompiService>;

  beforeEach(async () => {
    const mockTransactionRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
    };

    const mockWompiService = {
      createTransaction: jest.fn(),
      getTransactionStatus: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionService,
        {
          provide: TypeOrmTransactionRepository,
          useValue: mockTransactionRepository,
        },
        {
          provide: WompiService,
          useValue: mockWompiService,
        },
      ],
    }).compile();

    transactionService = module.get<TransactionService>(TransactionService);
    transactionRepository = module.get(TypeOrmTransactionRepository);
    wompiService = module.get(WompiService);
  });

  describe('create', () => {
    it('should create a transaction and update its status', async () => {
      const mockTransaction: Transaction = {
        id: 1,
        productId: 1,
        customerId: 1,
        amount: 100.0,
        status: 'PENDING',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockWompiResponse = {
        data: {
          status: 'OK',
          messages: [],
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {},
      };

      transactionRepository.create.mockResolvedValue(mockTransaction);
      wompiService.createTransaction.mockResolvedValue(mockWompiResponse);
      transactionRepository.update.mockResolvedValue({
        ...mockTransaction,
        status: 'OK',
      });

      const transaction = await transactionService.create(mockTransaction);

      expect(transactionRepository.create).toHaveBeenCalledWith(mockTransaction);
      expect(wompiService.createTransaction).toHaveBeenCalledWith(
        mockTransaction.amount * 100,
        mockTransaction.id.toString(),
        `transaction+${mockTransaction.id}@service.internal`,
      );
      expect(transactionRepository.update).toHaveBeenCalledWith({
        ...mockTransaction,
        status: 'OK',
      });
      expect(transaction.status).toBe('OK');
    });

    it('should handle an error when Wompi API fails during transaction creation', async () => {
      const mockTransaction: Transaction = {
        id: 1,
        productId: 1,
        customerId: 1,
        amount: 100.0,
        status: 'PENDING',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const errorWompiResponse = {
        data: {
          status: 'ERROR',
          messages: ['Something went wrong'],
        },
      };

      transactionRepository.create.mockResolvedValue(mockTransaction);
      wompiService.createTransaction.mockResolvedValue(errorWompiResponse);
      transactionRepository.update.mockResolvedValue({
        ...mockTransaction,
        status: 'ERROR',
      });

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      const transaction = await transactionService.create(mockTransaction);

      expect(transactionRepository.create).toHaveBeenCalledWith(mockTransaction);
      expect(wompiService.createTransaction).toHaveBeenCalledWith(
        mockTransaction.amount * 100,
        mockTransaction.id.toString(),
        `transaction+${mockTransaction.id}@service.internal`,
      );
      expect(transactionRepository.update).toHaveBeenCalledWith({
        ...mockTransaction,
        status: 'ERROR',
      });
      expect(transaction.status).toBe('ERROR');
      expect(consoleErrorSpy).toHaveBeenCalledWith('Wompi API Error');
      expect(consoleErrorSpy).toHaveBeenCalledWith(errorWompiResponse.data.messages);

      consoleErrorSpy.mockRestore();
    });
  });

  describe('findById', () => {
    it('should return a transaction by ID', async () => {
      const mockTransaction: Transaction = {
        id: 1,
        productId: 1,
        customerId: 1,
        amount: 100.0,
        status: 'PENDING',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      transactionRepository.findById.mockResolvedValue(mockTransaction);
      const result = await transactionService.findById(1);

      expect(result).toEqual(mockTransaction);
      expect(transactionRepository.findById).toHaveBeenCalledWith(1);
    });
  });

  describe('updateStatusFromWompi', () => {
    it('should update the transaction status from Wompi', async () => {
      const mockTransaction: Transaction = {
        id: 1,
        productId: 1,
        customerId: 1,
        amount: 100.0,
        status: 'PENDING',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
  
      const mockWompiResponse: AxiosResponse = {
        data: {
          status: 'OK',
          messages: [],
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {
          headers: {},
          method: 'get',
          url: 'https://example.com',
        } as InternalAxiosRequestConfig,
      };
  
      transactionRepository.findById.mockResolvedValue(mockTransaction);
      wompiService.getTransactionStatus.mockResolvedValue(mockWompiResponse);
      transactionRepository.update.mockResolvedValue({
        ...mockTransaction,
        status: 'OK',
      });
  
      const transaction = await transactionService.updateStatusFromWompi(mockTransaction.id.toString());
  
      if ('status' in transaction) {
        expect(transaction.status).toBe('OK');
      } else {
        fail('Expected a transaction but received an error');
      }
  
      expect(transactionRepository.findById).toHaveBeenCalledWith(mockTransaction.id);
      expect(wompiService.getTransactionStatus).toHaveBeenCalledWith(mockTransaction.id.toString());
      expect(transactionRepository.update).toHaveBeenCalledWith({
        ...mockTransaction,
        status: 'OK',
      });
    });
  });

  describe('update', () => {
    it('should update a transaction', async () => {
      const mockTransaction: Transaction = {
        id: 1,
        productId: 1,
        customerId: 1,
        amount: 100.0,
        status: 'OK',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      transactionRepository.update.mockResolvedValue(mockTransaction);

      const result = await transactionService.update(mockTransaction);

      expect(result).toEqual(mockTransaction);
      expect(transactionRepository.update).toHaveBeenCalledWith(mockTransaction);
    });
  });
});

describe('TransactionController', () => {
  let controller: TransactionController;
  let transactionService: jest.Mocked<TransactionService>;

  beforeEach(async () => {
    const mockTransactionService = {
      create: jest.fn(),
      update: jest.fn(),
      findById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TransactionController],
      providers: [
        {
          provide: TransactionService,
          useValue: mockTransactionService,
        },
      ],
    }).compile();

    controller = module.get<TransactionController>(TransactionController);
    transactionService = module.get(TransactionService);
  });

  describe('create', () => {
    it('should create a transaction and return it', async () => {
      const mockTransaction: Transaction = {
        id: 1,
        productId: 1,
        customerId: 1,
        amount: 100.0,
        status: 'PENDING',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      transactionService.create.mockResolvedValue({
        ...mockTransaction,
        status: 'OK',
      });

      const result = await controller.create(mockTransaction);

      expect(transactionService.create).toHaveBeenCalledWith(mockTransaction);
      expect(result).toEqual({
        ...mockTransaction,
        status: 'OK',
      });
    });

    it('should throw a TransactionCreationError if the status is ERROR', async () => {
      const mockTransaction: Transaction = {
        id: 1,
        productId: 1,
        customerId: 1,
        amount: 100.0,
        status: 'PENDING',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      transactionService.create.mockResolvedValue({
        ...mockTransaction,
        status: 'ERROR',
      });

      await expect(controller.create(mockTransaction)).rejects.toThrow(TransactionCreationError);
      expect(transactionService.create).toHaveBeenCalledWith(mockTransaction);
    });
  });

  describe('update', () => {
    it('should update a transaction and return it', async () => {
      const mockTransaction: Transaction = {
        id: 1,
        productId: 1,
        customerId: 1,
        amount: 100.0,
        status: 'PENDING',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updatedTransaction = {
        ...mockTransaction,
        status: 'OK',
      };
      transactionService.update.mockResolvedValue(updatedTransaction);

      const result = await controller.update(mockTransaction.id, updatedTransaction);

      expect(transactionService.update).toHaveBeenCalledWith(updatedTransaction);
      expect(result).toEqual(updatedTransaction);
    });
  });

  describe('findById', () => {
    it('should return a transaction by ID', async () => {
      const mockTransaction: Transaction = {
        id: 1,
        productId: 1,
        customerId: 1,
        amount: 100.0,
        status: 'PENDING',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      transactionService.findById.mockResolvedValue(mockTransaction);

      const result = await controller.findById(1);

      expect(transactionService.findById).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockTransaction);
    });
  });
});

