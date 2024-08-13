import { Controller, Post, Body, Get, Param, Patch } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { Transaction } from '../../core/entities/transactions/transaction.entity';

@Controller('transactions')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post()
  create(@Body() transaction: Transaction): Promise<Transaction> {
    return this.transactionService.create(transaction);
  }

  @Patch(':id')
  update(@Param('id') id: number, @Body() transaction: Transaction): Promise<Transaction> {
    transaction.id = id;
    return this.transactionService.update(transaction);
  }

  @Get(':id')
  findById(@Param('id') id: number): Promise<Transaction> {
    return this.transactionService.findById(id);
  }
}
