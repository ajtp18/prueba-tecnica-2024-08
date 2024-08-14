import { Product } from '../../core/entities/products/product.entity';
import type { IRepository } from './standard.repository'

export interface IProductRepository extends IRepository<Product> {
  updateStock(id: number, stock: number): Promise<void>;
}