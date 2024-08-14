import { Controller, Post, Body, Get, Param, Patch } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { Transaction } from '../../core/entities/transactions/transaction.entity';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { TransactionCreationError } from './transactions.exceptions';

@ApiTags('Transactions')
@Controller('transactions')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post()
  @ApiOperation({ summary: 'Create a transaction' })
  @ApiResponse({ status: 201, description: 'Transaction created successfully', type: Transaction })
  async create(@Body() transaction: Transaction): Promise<Transaction> {
    if (!transaction.status) {
      transaction.status = 'PENDING';
    }

    transaction.createdAt = new Date();
    transaction.updatedAt = new Date();

    const result = await this.transactionService.create(transaction);
    if (result.status == 'ERROR') {
      throw new TransactionCreationError(transaction);
    }
    
    return result;
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a transaction' })
  @ApiResponse({ status: 200, description: 'Transaction updated successfully', type: Transaction })
  update(@Param('id') id: number, @Body() transaction: Transaction): Promise<Transaction> {
    transaction.id = id;
    return this.transactionService.update(transaction);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a transaction' })
  @ApiResponse({ status: 200, description: 'Transaction result', type: Transaction })
  findById(@Param('id') id: number): Promise<Transaction> {
    return this.transactionService.findById(id);
  }
}
