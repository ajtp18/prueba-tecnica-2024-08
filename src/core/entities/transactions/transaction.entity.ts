import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class Transaction {
  @PrimaryGeneratedColumn()
  @ApiProperty({readOnly: true})
  id: number;

  @Column()
  @ApiProperty({type: 'number'})
  productId: number;

  @Column()
  @ApiProperty({type: 'number'})
  customerId: number;

  @Column('decimal')
  @ApiProperty({type: 'number', format: 'float'})
  amount: number;

  @Column()
  @ApiProperty({readOnly: true, type: 'string', enum: ['OK', 'ERROR', 'PENDING']})
  status: string;

  @CreateDateColumn()
  @ApiProperty({readOnly: true})
  createdAt: Date;

  @UpdateDateColumn()
  @ApiProperty({readOnly: true})
  updatedAt: Date;
}
