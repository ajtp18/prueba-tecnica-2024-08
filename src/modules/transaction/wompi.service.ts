import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { AxiosResponse } from 'axios';
import { of } from 'rxjs'
import { map, catchError } from 'rxjs/operators';
import { createHash } from 'crypto';

interface IPresignedData { 
  data: {
    presigned_acceptance: {
      acceptance_token: string;
    }
  }
}

@Injectable()
export class WompiService {
  private readonly baseUrl: string;
  private readonly publicKey: string;
  private readonly privateKey: string;
  private readonly signatureKey: string;

  constructor(
    private readonly httpService: HttpService,
    configService: ConfigService,
  ) {
    this.baseUrl = configService.get<string>('WOMPI_BASE_URL');
    this.publicKey = configService.get<string>('WOMPI_PUBLIC_KEY');
    this.privateKey = configService.get<string>('WOMPI_PRIVATE_KEY');
    this.signatureKey = configService.get<string>('WOMPI_SIGNATURE_KEY');
  }

  private getPresignedToken() {
    return this.httpService
      .get(`${this.baseUrl}/merchants/${this.publicKey}`)
      .pipe(map((el: AxiosResponse<IPresignedData>) => el.data.data.presigned_acceptance.acceptance_token))
      .toPromise();
  }

  private createSignature(reference: string, amount: number, currency: string): string {
      let raw = `${reference}${amount}${currency}${this.signatureKey}`;
      return createHash('sha256').update(raw).digest('hex');
  }

  async createTransaction(amountInCents: number, reference: string, customerEmail: string, cardToken: string) {
    let token = await this.getPresignedToken();
    
    const requestBody = {
      amount_in_cents: amountInCents,
      acceptance_token: token,
      currency: 'COP',
      customer_email: customerEmail,
      reference,
      signature: this.createSignature(reference, amountInCents, 'COP'),
      payment_method: {
        type: "CARD",
        installments: 1,
        token: cardToken
      },
    };

    return await this.httpService
      .post(`${this.baseUrl}/transactions`, requestBody, {
        headers: {
          Authorization: `Bearer ${this.privateKey}`,
        },
      }).pipe(catchError((err, source) => {
        return of({data: {status: 'ERROR', messages: err.response.data.error.messages}});
      })).toPromise();
  }

  getTransactionStatus(transactionId: string) {
    return this.httpService
      .get(`${this.baseUrl}/transactions/${transactionId}`, {
        headers: {
          Authorization: `Bearer ${this.privateKey}`,
        },
      }).toPromise();
  }
}
