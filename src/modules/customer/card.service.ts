import { ApiProperty } from '@nestjs/swagger';
import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { AxiosResponse } from 'axios';


export class Card {
  @ApiProperty()
  number: string;

  @ApiProperty()
  cvc: string;

  @ApiProperty()
  exp_month: string;

  @ApiProperty()
  exp_year: string;

  @ApiProperty()
  card_holder: string;
}

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

  async tokenizeCard(cardDetails: Card): Promise<string> {
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
