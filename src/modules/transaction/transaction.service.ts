import { Injectable } from '@nestjs/common';
import { TypeOrmTransactionRepository } from '../../infrastructure/repositories/typeorm-transaction.repository';
import { Transaction } from '../../core/entities/transactions/transaction.entity';
import { WompiService } from './wompi.service';

@Injectable()
export class TransactionService {
  constructor(
    private readonly transactionRepository: TypeOrmTransactionRepository,
    private readonly wompiService: WompiService,
  ) {}

  async create(transaction: Transaction): Promise<Transaction> {
    const createdTransaction = await this.transactionRepository.create(transaction);

    // TODO: Card injection
    const wompiResponse = await this.wompiService.createTransaction(
      transaction.amount * 100,
      createdTransaction.id.toString(),
      `transaction+${createdTransaction.id}@service.internal`,
    );

    if (wompiResponse.data.status == 'ERROR') {
      console.error('Wompi API Error');
      console.error(wompiResponse.data.messages);
    }

    createdTransaction.status = wompiResponse.data.status ?? 'OK';
    await this.transactionRepository.update(createdTransaction);

    return createdTransaction;
  }

  async findById(id: number): Promise<Transaction> {
    return this.transactionRepository.findById(id);
  }

  async updateStatusFromWompi(transactionId: string): Promise<Transaction | { error: string }> {
    const wompiResponse = await this.wompiService.getTransactionStatus(transactionId);
  
    if (!wompiResponse || !wompiResponse.data) {
      return { error: 'Invalid Wompi response' };
    }
  
    const transaction = await this.transactionRepository.findById(parseInt(transactionId));
    transaction.status = wompiResponse.data.status ?? 'OK';
  
    return this.transactionRepository.update(transaction);
  }

  async update(transaction: Transaction): Promise<Transaction> {
    return this.transactionRepository.update(transaction);
  }
}
