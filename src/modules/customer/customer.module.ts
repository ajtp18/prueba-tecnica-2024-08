import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { Customer } from '../../core/entities/customers/customer.entity';
import { CustomerService } from './customer.service';
import { CardService } from './card.service';
import { CustomersController } from './customer.controller';
import { TypeOrmCustomerRepository } from '../../infrastructure/repositories/typeorm-customer.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Customer]), HttpModule],
  providers: [
    CustomerService,
    CardService,
    TypeOrmCustomerRepository,
  ],
  controllers: [CustomersController],
})
export class CustomerModule {}
