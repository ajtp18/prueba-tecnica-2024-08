import { Transaction } from '../entities/transactions/transaction.entity';
import type { IRepository } from './standard.repository'

export type ITransactionRepository = IRepository<Transaction>;