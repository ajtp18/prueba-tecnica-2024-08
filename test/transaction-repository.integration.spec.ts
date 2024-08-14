import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmTransactionRepository } from '../src/infrastructure/repositories/typeorm-transaction.repository';
import { Transaction } from '../src/core/entities/transactions/transaction.entity';
import { DataSource } from 'typeorm';

describe('TransactionRepository Integration', () => {
  let transactionRepository: TypeOrmTransactionRepository;
  let dataSource: DataSource;

  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'postgres',
          host: 'localhost',
          port: 5432,
          username: 'atp',
          password: '12345',
          database: 'test_db',
          entities: [Transaction],
          synchronize: true,
          dropSchema: true,
        }),
        TypeOrmModule.forFeature([Transaction]),
      ],
      providers: [TypeOrmTransactionRepository],
    }).compile();

    transactionRepository = module.get<TypeOrmTransactionRepository>(TypeOrmTransactionRepository);
    dataSource = module.get<DataSource>(DataSource);
  });

  afterAll(async () => {
    await dataSource.destroy();
    await module.close();
  });

  it('should create and find a transaction', async () => {
    const transaction = new Transaction();
    transaction.productId = 1;
    transaction.customerId = 1;
    transaction.amount = 150.00;
    transaction.status = 'PENDING';

    const savedTransaction = await transactionRepository.create(transaction);
    expect(savedTransaction.id).toBeDefined();

    const foundTransaction = await transactionRepository.findById(savedTransaction.id);
    expect(foundTransaction).toBeDefined();
    expect(foundTransaction.amount).toBe(150.00);
  });

  it('should update a transaction', async () => {
    const transaction = new Transaction();
    transaction.productId = 1;
    transaction.customerId = 1;
    transaction.amount = 200.00;
    transaction.status = 'PENDING';

    const savedTransaction = await transactionRepository.create(transaction);
    savedTransaction.status = 'OK';

    const updatedTransaction = await transactionRepository.update(savedTransaction);
    expect(updatedTransaction.status).toBe('OK');
  });

  it('should find all transactions', async () => {
    const transactions = await transactionRepository.findAll();
    expect(transactions.length).toBeGreaterThan(0);
  });
});
