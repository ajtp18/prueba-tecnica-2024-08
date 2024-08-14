import { Test, TestingModule } from '@nestjs/testing';
import { WompiService } from '../wompi.service';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { of } from 'rxjs';
import { AxiosResponse } from 'axios';

describe('WompiService', () => {
  let service: WompiService;
  let httpService: HttpService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WompiService,
        {
          provide: HttpService,
          useValue: {
            get: jest.fn(),
            post: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              const config = {
                'WOMPI_BASE_URL': 'https://sandbox.wompi.co/v1',
                'WOMPI_PUBLIC_KEY': 'public-key',
                'WOMPI_PRIVATE_KEY': 'private-key',
                'WOMPI_SIGNATURE_KEY': 'signature-key',
              };
              return config[key];
            }),
          },
        },
      ],
    }).compile();

    service = module.get<WompiService>(WompiService);
    httpService = module.get<HttpService>(HttpService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getPresignedToken', () => {
    it('should return a presigned token', async () => {
      const mockResponse = {
        data: {
          data: {
            presigned_acceptance: {
              acceptance_token: 'mock-token',
            },
          },
        },
      } as AxiosResponse;

      jest.spyOn(httpService, 'get').mockReturnValue(of(mockResponse));

      const result = await service['getPresignedToken']();
      expect(result).toBe('mock-token');
      expect(httpService.get).toHaveBeenCalledWith('https://sandbox.wompi.co/v1/merchants/public-key');
    });
  });

  describe('createTransaction', () => {
    it('should create a transaction and return the response', async () => {
      const mockResponse = {
        data: {
          data: {
            id: 'transaction-id',
            status: 'APPROVED',
          },
        },
      } as AxiosResponse;
  
      jest.spyOn(httpService, 'post').mockReturnValue(of(mockResponse));
      jest.spyOn(httpService, 'get').mockReturnValue(
        of({
          data: {
            data: {
              presigned_acceptance: {
                acceptance_token: 'mock-token',
              },
            },
          },
        } as AxiosResponse)
      );
  
      const result = await service.createTransaction(10000, 'ref123', 'customer@example.com', 'card-token');
  
      expect(result.data.data.id).toBe('transaction-id');
      expect(result.data.data.status).toBe('APPROVED');
      expect(httpService.post).toHaveBeenCalledWith(
        'https://sandbox.wompi.co/v1/transactions',
        {
          amount_in_cents: 10000,
          acceptance_token: 'mock-token',
          currency: 'COP',
          customer_email: 'customer@example.com',
          reference: 'ref123',
          signature: expect.any(String),
          payment_method: {
            type: 'CARD',
            installments: 1,
            token: 'card-token',
          },
        },
        {
          headers: {
            Authorization: `Bearer private-key`,
          },
        }
      );
    });
  });

  describe('getTransactionStatus', () => {
    it('should return transaction status', async () => {
      const mockResponse = {
        data: {
          data: {
            status: 'APPROVED',
          },
        },
      } as AxiosResponse;

      jest.spyOn(httpService, 'get').mockReturnValue(of(mockResponse));

      const result = await service.getTransactionStatus('transaction-id');
      expect(result).toBe('APPROVED');
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