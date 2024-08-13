import { Injectable } from '@nestjs/common';
import { TransactionRepository } from '../../core/repositories/transaction.repository';
import { Transaction } from '../../core/entities/transactions/transaction.entity';
import { WompiService } from './wompi.service';

@Injectable()
export class TransactionService {
  constructor(
    private readonly transactionRepository: TransactionRepository,
    private readonly wompiService: WompiService,
  ) {}

  async create(transaction: Transaction): Promise<Transaction> {
    const createdTransaction = await this.transactionRepository.create(transaction);

    const wompiResponse = await this.wompiService.createTransaction(
      transaction.amount * 100,
      createdTransaction.id.toString(),
    );

    createdTransaction.status = wompiResponse.data.status;
    await this.transactionRepository.update(createdTransaction);

    return createdTransaction;
  }

  async findById(id: number): Promise<Transaction> {
    return this.transactionRepository.findById(id);
  }

  async updateStatusFromWompi(transactionId: string): Promise<Transaction> {
    const wompiResponse = await this.wompiService.getTransactionStatus(transactionId);
    const transaction = await this.transactionRepository.findById(parseInt(transactionId));

    transaction.status = wompiResponse.data.status;
    return this.transactionRepository.update(transaction);
  }

  async update(transaction: Transaction): Promise<Transaction> {
    return this.transactionRepository.update(transaction);
  }
}
