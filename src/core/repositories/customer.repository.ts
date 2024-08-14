import { Customer } from '../entities/customers/customer.entity';
import type { IRepository } from './standard.repository'

export interface ICustomerRepository extends IRepository<Customer> {
    addCard(id: number, card: string): Promise<number>;
}