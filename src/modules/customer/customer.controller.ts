import { Controller, Body, Param, Post, Patch, Get } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { Card, CardService } from './card.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Customer } from '../../core/entities/customers/customer.entity';
import * as bcrypt from 'bcrypt';

@ApiTags('Customers')
@Controller('customer')
export class CustomersController {
  constructor(
    private readonly customerService: CustomerService,
    private readonly cardService: CardService,
  ) {}

  @Post()
  @ApiOperation({summary: 'Create a customer'})
  @ApiResponse({status: 200, description: 'Customer succesfully created', type: Customer})
  async create(@Body() customer: Customer): Promise<Customer> {
    customer.cards = {};
    customer.pin = await bcrypt.hash(customer.pin, 10);

    return await this.customerService.save(customer);
  }

  @Get(':id')
  @ApiOperation({summary: 'Get a customer'})
  @ApiResponse({status: 200, description: 'Customer result', type: Customer})
  async getById(@Param('id') id: number): Promise<Customer> {
    return await this.customerService.findById(id);
  }

  @Patch(':id')
  @ApiOperation({summary: 'Update a customer'})
  @ApiResponse({status: 200, description: 'Customer succesfully updated', type: Customer})
  async update(@Param('id') id: number, @Body() customer: Customer): Promise<Customer> {
    customer.id = id;

    return await this.customerService.save(customer);
  }

  @Patch(':id/addCard')
  @ApiOperation({summary: 'Add a card to a customer'})
  @ApiResponse({status: 200, description: 'Card added succesfully', type: Number})
  async addCard(@Param('id') id: number, @Body() card: Card) {
    let cardId = await this.cardService.tokenizeCard(card);
    return await this.customerService.addCard(id, cardId);
  } 
}
