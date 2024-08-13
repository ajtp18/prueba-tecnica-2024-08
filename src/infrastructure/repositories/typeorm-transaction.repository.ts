import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from '../../core/entities/transactions/transaction.entity';
import { TransactionRepository } from '../../core/repositories/transaction.repository';

@Injectable()
export class TypeOrmTransactionRepository implements TransactionRepository {
  constructor(
    @InjectRepository(Transaction)
    private readonly ormRepository: Repository<Transaction>,
  ) {}

  async create(transaction: Transaction): Promise<Transaction> {
    return this.ormRepository.save(transaction);
  }

  async update(transaction: Transaction): Promise<Transaction> {
    return this.ormRepository.save(transaction);
  }

  async findById(id: number): Promise<Transaction> {
    return this.ormRepository.findOneBy({ id });
  }
}
