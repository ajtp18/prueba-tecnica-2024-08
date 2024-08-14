import { Test, TestingModule } from '@nestjs/testing';
import { TransactionModule } from '../transaction.module';
import { TypeOrmModule, getDataSourceToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Transaction } from '../../../core/entities/transactions/transaction.entity';
import { TypeOrmTransactionRepository } from '../../../infrastructure/repositories/typeorm-transaction.repository';
import { ConfigModule, ConfigService } from '@nestjs/config';

describe('TransactionModule', () => {
  let module: TestingModule;
  let dataSource: DataSource;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        TypeOrmModule.forRootAsync({
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: (configService: ConfigService) => ({
            type: 'postgres',
            host: configService.get<string>('DB_HOST'),
            port: parseInt(configService.get<string>('DB_PORT'), 5432),
            username: configService.get<string>('DB_USERNAME'),
            password: configService.get<string>('DB_PASSWORD'),
            database: configService.get<string>('DB_NAME'),
            entities: [Transaction],
            synchronize: true,
            dropSchema: true,
          }),
        }),
        TypeOrmModule.forFeature([Transaction]),
        TransactionModule,
      ],
    }).compile();

    dataSource = module.get<DataSource>(getDataSourceToken());
  });

  afterAll(async () => {
    if (dataSource && dataSource.isInitialized) {
      await dataSource.destroy();
    }
    await module.close();
  });

  it('should compile the module', () => {
    const transactionRepository = module.get<TypeOrmTransactionRepository>(TypeOrmTransactionRepository);
    expect(transactionRepository).toBeDefined();

  });
});
