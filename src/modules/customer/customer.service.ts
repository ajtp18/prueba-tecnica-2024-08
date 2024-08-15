import { Injectable } from '@nestjs/common';
import { TypeOrmCustomerRepository } from '../../infrastructure/repositories/typeorm-customer.repository';
import { Customer } from '../../core/entities/customers/customer.entity';

@Injectable()
export class CustomerService {
  constructor(
    private readonly customerRepository: TypeOrmCustomerRepository,
  ) {}

  findAll(): Promise<Customer[]> {
    return this.customerRepository.findAll();
  }

  findById(id: number): Promise<Customer> {
    return this.customerRepository.findById(id);
  }

  save(customer: Customer): Promise<Customer> {
    return this.customerRepository.create(customer);
  }

  addCard(id: number, card: string): Promise<number> {
    return this.customerRepository.addCard(id, card);
  }
}
