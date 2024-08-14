import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class Product {
  @PrimaryGeneratedColumn()
  @ApiProperty({type: 'integer'})
  id: number;

  @Column()
  @ApiProperty({type: 'string'})
  name: string;

  @Column('decimal')
  @ApiProperty({type: 'number', format: 'float'})
  price: number;

  @Column()
  @ApiProperty({type: 'integer'})
  stock: number;
}