import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';

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
  @Exclude()
  stock: number;
}
