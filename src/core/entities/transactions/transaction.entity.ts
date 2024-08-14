import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Product } from '../products/product.entity';
import { Customer } from '../customers/customer.entity';
import { Delivery } from '../deliveries/delivery.entity';
import { Exclude } from 'class-transformer';

@Entity()
export class Transaction {
  @PrimaryGeneratedColumn()
  @ApiProperty({readOnly: true})
  id: number;

  @ManyToOne(() => Product, product => product.id, { eager: true })
  @JoinColumn({ name: 'productId' })
  @ApiProperty({ type: () => Product })
  product: Product;

  @ManyToOne(() => Customer, customer => customer.id, { eager: true })
  @JoinColumn({ name: 'customerId' })
  @ApiProperty({ type: () => Customer })
  customer: Customer;

  @OneToOne(() => Delivery, delivery => delivery.transaction, { eager: true })
  @ApiProperty({ type: () => Delivery })
  @Exclude()
  delivery: Delivery;

  @Column('decimal')
  @ApiProperty({type: 'number', format: 'float'})
  amount: number;

  @Column()
  @ApiProperty({readOnly: true, type: 'string', enum: ['OK', 'ERROR', 'PENDING']})
  status: string;

  @Column({nullable: true})
  @ApiProperty({readOnly: true})
  paymentReference: string;

  @Column({nullable: true})
  @ApiProperty({readOnly: true})
  @Exclude()
  paymentId: string;

  @CreateDateColumn()
  @ApiProperty({readOnly: true})
  createdAt: Date;

  @UpdateDateColumn()
  @ApiProperty({readOnly: true})
  updatedAt: Date;
}
