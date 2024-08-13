import { Injectable } from '@nestjs/common';
import { TypeOrmProductRepository } from '../../infrastructure/repositories/typeorm-product.repository';
import { Product } from '../../core/entities/products/product.entity';

@Injectable()
export class ProductService {
  constructor(
    private readonly productRepository: TypeOrmProductRepository,
  ) {}

  findAll(): Promise<Product[]> {
    return this.productRepository.findAll();
  }

  findById(id: number): Promise<Product> {
    return this.productRepository.findById(id);
  }

  save(product: Product): Promise<Product> {
    return this.productRepository.save(product);
  }

  updateStock(id: number, stock: number): Promise<void> {
    return this.productRepository.updateStock(id, stock);
  }
}
