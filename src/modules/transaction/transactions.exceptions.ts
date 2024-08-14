import { HttpException, HttpStatus } from '@nestjs/common';
import { Transaction } from '../../core/entities/transactions/transaction.entity';

export class TransactionCreationError extends HttpException {
  constructor(transaction: Transaction) {
    super({error: 'Error when creating the transaction', payload: transaction}, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}