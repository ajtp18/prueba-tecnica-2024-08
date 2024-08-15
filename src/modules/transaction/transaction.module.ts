import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { Transaction } from '../../core/entities/transactions/transaction.entity';
import { Product } from '../../core/entities/products/product.entity';
import { Customer } from '../../core/entities/customers/customer.entity';
import { TransactionService } from './transaction.service';
import { TransactionController } from './transaction.controller';
import { TypeOrmTransactionRepository } from '../../infrastructure/repositories/typeorm-transaction.repository';
import { TypeOrmProductRepository } from '../../infrastructure/repositories/typeorm-product.repository';
import { TypeOrmCustomerRepository } from '../../infrastructure/repositories/typeorm-customer.repository';
import { WompiService } from './wompi.service';

@Module({
  imports: [TypeOrmModule.forFeature([Transaction, Product, Customer]), HttpModule],
  providers: [
    TransactionService,
    TypeOrmTransactionRepository,
    TypeOrmProductRepository,
    TypeOrmCustomerRepository,
    WompiService,
  ],
  controllers: [TransactionController],
})
export class TransactionModule {}