import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from './product.controller';
import { ProductService } from './product.service';
import { TypeOrmProductRepository } from '../../infrastructure/repositories/typeorm-product.repository';
import { Product } from '../../core/entities/products/product.entity';

describe('ProductService', () => {
  let productService: ProductService;
  let productRepository: jest.Mocked<TypeOrmProductRepository>;

  beforeEach(async () => {
    const mockProductRepository = {
      findAll: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      updateStock: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        {
          provide: TypeOrmProductRepository,
          useValue: mockProductRepository,
        },
      ],
    }).compile();

    productService = module.get<ProductService>(ProductService);
    productRepository = module.get(TypeOrmProductRepository);
  });

  describe('findAll', () => {
    it('should return an array of products', async () => {
      const expectedProducts: Product[] = [
        { id: 1, name: 'Product 1', price: 10.99, stock: 100 },
        { id: 2, name: 'Product 2', price: 20.99, stock: 50 },
      ];
      productRepository.findAll.mockResolvedValue(expectedProducts);

      const result = await productService.findAll();

      expect(result).toEqual(expectedProducts);
      expect(productRepository.findAll).toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    it('should return a product by id', async () => {
      const expectedProduct: Product = { id: 1, name: 'Product 1', price: 10.99, stock: 100 };
      productRepository.findById.mockResolvedValue(expectedProduct);

      const result = await productService.findById(1);

      expect(result).toEqual(expectedProduct);
      expect(productRepository.findById).toHaveBeenCalledWith(1);
    });
  });

  describe('save', () => {
    it('should create a new product', async () => {
      const newProduct: Product = { id: 1, name: 'New Product', price: 15.99, stock: 75 };
      productRepository.create.mockResolvedValue(newProduct);

      const result = await productService.save(newProduct);

      expect(result).toEqual(newProduct);
      expect(productRepository.create).toHaveBeenCalledWith(newProduct);
    });
  });

  describe('updateStock', () => {
    it('should update the stock of a product', async () => {
      const productId = 1;
      const newStock = 50;
      productRepository.updateStock.mockResolvedValue();

      await productService.updateStock(productId, newStock);

      expect(productRepository.updateStock).toHaveBeenCalledWith(productId, newStock);
    });
  });
});

describe('ProductsController', () => {
  let controller: ProductsController;
  let productService: jest.Mocked<ProductService>;

  beforeEach(async () => {
    const mockProductService = {
      findAll: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
        {
          provide: ProductService,
          useValue: mockProductService,
        },
      ],
    }).compile();

    controller = module.get<ProductsController>(ProductsController);
    productService = module.get(ProductService);
  });

  describe('findAll', () => {
    it('should return an array of products', async () => {
      const expectedProducts: Product[] = [
        { id: 1, name: 'Product 1', price: 10.99, stock: 100 },
        { id: 2, name: 'Product 2', price: 20.99, stock: 50 },
      ];
      productService.findAll.mockResolvedValue(expectedProducts);

      const result = await controller.findAll();

      expect(result).toEqual(expectedProducts);
      expect(productService.findAll).toHaveBeenCalled();
    });

    it('should handle empty product list', async () => {
      const expectedProducts: Product[] = [];
      productService.findAll.mockResolvedValue(expectedProducts);

      const result = await controller.findAll();

      expect(result).toEqual([]);
      expect(productService.findAll).toHaveBeenCalled();
    });

    it('should handle service errors', async () => {
      const errorMessage = 'Database connection error';
      productService.findAll.mockRejectedValue(new Error(errorMessage));

      await expect(controller.findAll()).rejects.toThrow(errorMessage);
      expect(productService.findAll).toHaveBeenCalled();
    });
  });
});