import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from '../../core/entities/products/product.entity';
import { ProductService } from './product.service';
import { ProductsController } from './product.controller';
import { TypeOrmProductRepository } from '../../infrastructure/repositories/typeorm-product.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Product])],
  providers: [
    ProductService,
    TypeOrmProductRepository,
  ],
  controllers: [ProductsController],
})
export class ProductModule {}
