import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { ProductModule } from './modules/product/product.module';
import { Product } from './core/entities/products/product.entity';
import { Transaction } from './core/entities/transactions/transaction.entity';
import { Customer } from './core/entities/customers/customer.entity';
import { Delivery } from './core/entities/deliveries/delivery.entity';
import { TransactionModule } from './modules/transaction/transaction.module';
import { CustomerModule } from './modules/customer/customer.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [Product, Transaction, Customer, Delivery],
      synchronize: true,
    }),
    ProductModule,
    TransactionModule,
    CustomerModule,
  ],
})
export class AppModule {}
