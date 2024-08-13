import { Product } from '../../core/entities/products/product.entity';

export interface ProductRepository {
  findAll(): Promise<Product[]>;
  findById(id: number): Promise<Product>;
  save(product: Product): Promise<Product>;
  updateStock(id: number, stock: number): Promise<void>;
}
