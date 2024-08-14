import { Controller, Post, Body, Get, Param, Patch, UseInterceptors, ClassSerializerInterceptor } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { Transaction } from '../../core/entities/transactions/transaction.entity';
import { ApiTags, ApiOperation, ApiResponse, ApiProperty } from '@nestjs/swagger';
import { TransactionCreationError } from './transactions.exceptions';

class TransactionCreationClaim {
  @ApiProperty()
  productId: number;

  @ApiProperty()
  customerId: number;

  @ApiProperty()
  cardIndex: number;
}

@ApiTags('Transactions')
@Controller('transactions')
@UseInterceptors(ClassSerializerInterceptor)
export class TransactionController {
  constructor(
    private readonly transactionService: TransactionService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a transaction' })
  @ApiResponse({ status: 201, description: 'Transaction created successfully', type: Transaction })
  async create(@Body() transactionClaim: TransactionCreationClaim): Promise<Transaction> {
    const transaction = await this.transactionService.create(transactionClaim.productId, transactionClaim.customerId, transactionClaim.cardIndex);
    if (transaction.status == 'ERROR') {
      throw new TransactionCreationError(transaction);
    }
    
    return transaction;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a transaction' })
  @ApiResponse({ status: 200, description: 'Transaction result', type: Transaction })
  findById(@Param('id') id: number): Promise<Transaction> {
    return this.transactionService.findById(id);
  }
}


