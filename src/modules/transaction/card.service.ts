import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { AxiosResponse } from 'axios';

@Injectable()
export class CardService {
  private readonly baseUrl: string;
  private readonly publicKey: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.baseUrl = this.configService.get<string>('WOMPI_BASE_URL');
    this.publicKey = this.configService.get<string>('WOMPI_PUBLIC_KEY');
  }

  async tokenizeCard(cardDetails: {
    number: string;
    cvc: string;
    exp_month: string;
    exp_year: string;
    card_holder: string;
  }): Promise<string> {
    const response = await this.httpService
      .post(`${this.baseUrl}/tokens/cards`, cardDetails, {
        headers: {
          Authorization: `Bearer ${this.publicKey}`,
        },
      })
      .toPromise();

    if (response.data && response.data.data && response.data.data.id) {
      return response.data.data.id;
    }

    throw new Error('Failed to tokenize card');
  }
}
