import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmProductRepository } from '../src/infrastructure/repositories/typeorm-product.repository';
import { Product } from '../src/core/entities/products/product.entity';
import { DataSource } from 'typeorm';

describe('ProductRepository Integration', () => {
  let productRepository: TypeOrmProductRepository;
  let dataSource: DataSource;

  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'postgres',
          host: 'localhost',
          port: 5432,
          username: 'atp',
          password: '12345',
          database: 'test_db',
          entities: [Product],
          synchronize: true,
          dropSchema: true,
        }),
        TypeOrmModule.forFeature([Product]),
      ],
      providers: [TypeOrmProductRepository],
    }).compile();

    productRepository = module.get<TypeOrmProductRepository>(TypeOrmProductRepository);
    dataSource = module.get<DataSource>(DataSource);
  });

  afterAll(async () => {
    await dataSource.destroy();
    await module.close();
  });

  it('should create and find a product', async () => {
    const product = new Product();
    product.name = 'Test Product';
    product.price = 99.99;
    product.stock = 100;

    const savedProduct = await productRepository.create(product);
    expect(savedProduct.id).toBeDefined();

    const foundProduct = await productRepository.findById(savedProduct.id);
    expect(foundProduct).toBeDefined();
    expect(foundProduct.name).toBe('Test Product');
  });

  it('should update the stock of a product', async () => {
    const product = new Product();
    product.name = 'Stock Product';
    product.price = 50;
    product.stock = 10;

    const savedProduct = await productRepository.create(product);
    await productRepository.updateStock(savedProduct.id, 20);

    const updatedProduct = await productRepository.findById(savedProduct.id);
    expect(updatedProduct.stock).toBe(20);
  });

  it('should find all products', async () => {
    const products = await productRepository.findAll();
    expect(products.length).toBeGreaterThan(0);
  });
});
