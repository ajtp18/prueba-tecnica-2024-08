import { Injectable } from '@nestjs/common';
import { TypeOrmTransactionRepository } from '../../infrastructure/repositories/typeorm-transaction.repository';
import { Transaction } from '../../core/entities/transactions/transaction.entity';
import { WompiService } from './wompi.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from '../../core/entities/products/product.entity';
import { TypeOrmProductRepository } from '../../infrastructure/repositories/typeorm-product.repository';
import { TypeOrmCustomerRepository } from '../../infrastructure/repositories/typeorm-customer.repository';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TransactionService {
  private readonly referencePrefix: string;
  constructor(
    private readonly transactionRepository: TypeOrmTransactionRepository,
    private readonly productRepository: TypeOrmProductRepository,
    private readonly customerRepository: TypeOrmCustomerRepository,
    private readonly wompiService: WompiService,
    configService: ConfigService,
  ) {
    this.referencePrefix = configService.get<string>('WOMPI_REFERENCE_PREFIX', 'WOMPITEST')
  }

  async create(productId: number, customerId: number, cardIndex: number): Promise<Transaction> {
    let product = await this.productRepository.findById(productId);
    if (product.stock > 0) {
      await this.productRepository.updateStock(product.id, product.stock - 1);
    } else {
      throw new Error(`The producto #${product.id} is out of stock, try again later`)
    }

    const transaction = new Transaction();
    transaction.customer = await this.customerRepository.findById(customerId);
    transaction.amount = product.price;
    transaction.product = product;
    transaction.status = 'PENDING';
    transaction.createdAt = new Date();
    transaction.updatedAt = new Date();

    const createdTransaction = await this.transactionRepository.create(transaction);

    const cardToken = transaction.customer.cards[cardIndex];
    if (!cardToken) {
      throw new Error('The referenced card is disabled or not exists');
    }

    let reference = this.referencePrefix + createdTransaction.id.toString();
    const wompiResponse = await this.wompiService.createTransaction(
      Math.floor(transaction.amount) * 100,
      reference,
      `transaction+${createdTransaction.id}@service.internal`,
      cardToken,
    );

    if (wompiResponse.data.status == 'ERROR') {
      console.error('Wompi API Error');
      console.error(wompiResponse.data.messages);
    } else {
      console.log('Wompi response');
      console.error(wompiResponse.data);
    }

    createdTransaction.status = wompiResponse.data.data.status ?? 'OK';
    createdTransaction.paymentReference = reference;
    createdTransaction.paymentId = wompiResponse.data.data.id;

    await this.transactionRepository.update(createdTransaction);

    return createdTransaction;
  }

  async findById(id: number): Promise<Transaction> {
    const transaction = await this.transactionRepository.findById(id);
    if (transaction.status) {
      transaction.status = await this.wompiService.getTransactionStatus(transaction.paymentId);

      await this.transactionRepository.update(transaction);
    }
    return transaction;
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
