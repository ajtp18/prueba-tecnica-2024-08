import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from '../../core/entities/customers/customer.entity';
import { ICustomerRepository } from '../../core/repositories/customer.repository';

@Injectable()
export class TypeOrmCustomerRepository implements ICustomerRepository {
  constructor(
    @InjectRepository(Customer)
    private readonly ormRepository: Repository<Customer>,
  ) {}

  async findAll(): Promise<Customer[]> {
    return this.ormRepository.find();
  }

  async create(customer: Customer): Promise<Customer> {
    return this.ormRepository.save(customer);
  }

  async update(customer: Customer): Promise<Customer> {
    return this.ormRepository.save(customer);
  }

  async findById(id: number): Promise<Customer> {
    return this.ormRepository.findOneBy({ id });
  }

  async addCard(id: number, card: string): Promise<number> {
      let customer = await this.findById(id);
      let nextCardId = Object.keys(customer.cards).reduce((acc, el) => {
        if (acc <= parseInt(el)) {
          acc = parseInt(el) + 1;
        }

        return acc;
      }, 1);

      customer.cards[nextCardId] = card;
      await this.update(customer);

      return nextCardId
  }
}
