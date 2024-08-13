import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { Transaction } from '../../core/entities/transactions/transaction.entity';
import { TransactionService } from './transaction.service';
import { TransactionController } from './transaction.controller';
import { TypeOrmTransactionRepository } from '../../infrastructure/repositories/typeorm-transaction.repository';
import { WompiService } from './wompi.service';

@Module({
  imports: [TypeOrmModule.forFeature([Transaction]), HttpModule],
  providers: [
    TransactionService,
    TypeOrmTransactionRepository,
    WompiService,
  ],
  controllers: [TransactionController],
})
export class TransactionModule {}
