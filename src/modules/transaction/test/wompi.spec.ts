import { Test, TestingModule } from '@nestjs/testing';
import { WompiService } from '../wompi.service';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { of } from 'rxjs';
import { AxiosResponse, InternalAxiosRequestConfig } from 'axios';

describe('WompiService', () => {
  let service: WompiService;
  let httpService: jest.Mocked<HttpService>;
  let configService: jest.Mocked<ConfigService>;

  const mockConfigService = {
    get: jest.fn(),
  };

  const mockHttpService = {
    get: jest.fn(),
    post: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WompiService,
        { provide: HttpService, useValue: mockHttpService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<WompiService>(WompiService);
    httpService = module.get(HttpService);
    configService = module.get(ConfigService);

    // Mock configuration values
    configService.get.mockImplementation((key: string) => {
      switch (key) {
        case 'WOMPI_BASE_URL':
          return 'https://sandbox.wompi.co/v1';
        case 'WOMPI_PUBLIC_KEY':
          return 'public-key';
        case 'WOMPI_PRIVATE_KEY':
          return 'private-key';
        case 'WOMPI_SIGNATURE_KEY':
          return 'signature-key';
        default:
          return null;
      }
    });
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getPresignedToken', () => {
    it('should return a presigned token', async () => {
      const mockResponse: AxiosResponse = {
        data: {
          data: {
            presigned_acceptance: {
              acceptance_token: 'test-token',
            },
          },
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {
            headers: {},
            method: 'get',
            url: 'https://example.com',
          } as InternalAxiosRequestConfig,
      };

      httpService.get.mockReturnValue(of(mockResponse));

      const token = await (service as any).getPresignedToken(); // getPresignedToken is private
      expect(token).toBe('test-token');
      expect(httpService.get).toHaveBeenCalledWith('https://sandbox.wompi.co/v1/merchants/public-key');
    });
  });

  describe('createSignature', () => {
    it('should create a correct signature', () => {
      const signature = (service as any).createSignature('test-ref', 10000.00, 'COP');
      expect(signature).toBe('6eeefd31afae0e9a990007bb9e31c59eb787e6a086e5016ded79d1cb9e4343a1');
    });
  });

  describe('createTransaction', () => {
    it('should create a transaction and return the response', async () => {
      const mockPresignedToken = 'test-token';
      const mockTransactionResponse: AxiosResponse = {
        data: {
          status: 'OK',
          transaction: {},
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {
            headers: {},
            method: 'get',
            url: 'https://example.com',
          } as InternalAxiosRequestConfig,
      };
  
      // Mock de la obtención del token presigned
      jest.spyOn(service as any, 'getPresignedToken').mockResolvedValue(mockPresignedToken);
      httpService.post.mockReturnValue(of(mockTransactionResponse));
  
      const response = await service.createTransaction(10000, 'test-ref', 'test@example.com');
  
      expect(response.data.status).toBe('OK');
      expect(httpService.post).toHaveBeenCalledWith(
        'https://sandbox.wompi.co/v1/transactions',
        {
          amount_in_cents: 10000,
          acceptance_token: mockPresignedToken,
          currency: 'COP',
          customer_email: 'test@example.com',
          reference: 'test-ref',
          signature: expect.any(String),
          payment_method: {
            type: 'NEQUI',
            phone_number: '3107654321', 
          },
        },
        {
          headers: {
            Authorization: `Bearer private-key`,
          },
        }
      );
    });
  
    it('should handle an error during transaction creation', async () => {
      const mockPresignedToken = 'test-token';
      const mockErrorResponse = {
        response: {
          data: {
            error: {
              messages: ['Some error occurred'],
            },
          },
        },
      };
  
      jest.spyOn(service as any, 'getPresignedToken').mockResolvedValue(mockPresignedToken);
      
      httpService.post.mockReturnValueOnce(
        of({
          data: {
            status: 'ERROR',
            messages: mockErrorResponse.response.data.error.messages,
          },
          status: 400,
          statusText: 'Bad Request',
          headers: {},
          config: {},
        } as AxiosResponse)
      );
  
      const response = await service.createTransaction(10000, 'test-ref', 'test@example.com');
  
      expect(response.data.status).toBe('ERROR');
      expect(response.data.messages).toContain('Some error occurred');
    });
  });

  describe('getTransactionStatus', () => {
    it('should return the transaction status', async () => {
      const mockTransactionResponse: AxiosResponse = {
        data: {
          status: 'OK',
          transaction: {},
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {
            headers: {},
            method: 'get',
            url: 'https://example.com',
          } as InternalAxiosRequestConfig,
      };

      httpService.get.mockReturnValue(of(mockTransactionResponse));

      const response = await service.getTransactionStatus('transaction-id');

      expect(response.data.status).toBe('OK');
      expect(httpService.get).toHaveBeenCalledWith(
        'https://sandbox.wompi.co/v1/transactions/transaction-id',
        {
          headers: {
            Authorization: `Bearer private-key`,
          },
        }
      );
    });
  });
});
