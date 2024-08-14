import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Exclude } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { Transaction } from '../transactions/transaction.entity';

@Entity()
export class Customer {
  @PrimaryGeneratedColumn()
  @ApiProperty({readOnly: true, type: 'integer'})
  id: number;

  @Column()
  @ApiProperty()
  name: string;

  @Column()
  @ApiProperty()
  @Exclude()
  pin: string;

  @Column({type: 'jsonb'})
  cards: {[k: number]: string};

  @OneToMany(() => Transaction, transaction => transaction.customer)
  transactions: Transaction[];
}