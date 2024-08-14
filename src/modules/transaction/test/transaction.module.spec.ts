import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { TransactionModule } from '../transaction.module';
import { TypeOrmModule, getDataSourceToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Transaction } from '../../../core/entities/transactions/transaction.entity';
import { TypeOrmTransactionRepository } from '../../../infrastructure/repositories/typeorm-transaction.repository';

describe('TransactionModule', () => {
  let module: TestingModule;
  let dataSource: DataSource;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        TypeOrmModule.forRoot({
          type: 'postgres',
          host: 'localhost',
          port: 5432,
          username: 'atp',
          password: '12345',
          database: 'wompi',
          entities: [Transaction],
          synchronize: true,
          dropSchema: true,
        }),
        TypeOrmModule.forFeature([Transaction]),
        TransactionModule,
      ],
    }).compile();

    dataSource = module.get<DataSource>(getDataSourceToken());
  });

  afterAll(async () => {
    await dataSource.destroy();
    await module.close();
  });

  it('should compile the module', () => {
    const transactionRepository = module.get<TypeOrmTransactionRepository>(TypeOrmTransactionRepository);
    expect(transactionRepository).toBeDefined();
  });
});
