import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../../core/entities/products/product.entity';
import { IProductRepository } from '../../core/repositories/product.repository';

@Injectable()
export class TypeOrmProductRepository implements IProductRepository {
  constructor(
    @InjectRepository(Product)
    private readonly ormRepository: Repository<Product>,
  ) {}

  async findAll(): Promise<Product[]> {
    return this.ormRepository.find();
  }

  async findById(id: number): Promise<Product> {
    return this.ormRepository.findOneBy({ id });
  }

  async create(product: Product): Promise<Product> {
    return this.ormRepository.save(product);
  }

  async updateStock(id: number, stock: number): Promise<void> {
    await this.ormRepository.update(id, { stock });
  }
}
