import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { AxiosResponse } from 'axios';

@Injectable()
export class WompiService {
  private readonly baseUrl: string;
  private readonly publicKey: string;
  private readonly privateKey: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.baseUrl = this.configService.get<string>('WOMPI_BASE_URL');
    this.publicKey = this.configService.get<string>('WOMPI_PUBLIC_KEY');
    this.privateKey = this.configService.get<string>('WOMPI_PRIVATE_KEY');
  }

  async createTransaction(amountInCents: number, reference: string): Promise<AxiosResponse<any>> {
    const requestBody = {
      amount_in_cents: amountInCents,
      currency: 'COP',
      customer_email: 'customer@example.com',
      payment_method: {
        type: 'CARD',
        token: 'tok_test_token',
      },
      reference,
    };

    return this.httpService
      .post(`${this.baseUrl}/transactions`, requestBody, {
        headers: {
          Authorization: `Bearer ${this.privateKey}`,
        },
      })
      .toPromise();
  }

  async getTransactionStatus(transactionId: string): Promise<AxiosResponse<any>> {
    return this.httpService
      .get(`${this.baseUrl}/transactions/${transactionId}`, {
        headers: {
          Authorization: `Bearer ${this.privateKey}`,
        },
      })
      .toPromise();
  }
}
