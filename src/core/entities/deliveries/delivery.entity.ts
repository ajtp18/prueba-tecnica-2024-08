import { Entity, OneToOne, JoinColumn, PrimaryGeneratedColumn, Column } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Transaction } from '../transactions/transaction.entity';

@Entity()
export class Delivery {
    @PrimaryGeneratedColumn()
    @ApiProperty({readOnly: true, type: 'integer'})
    id: number;

    @OneToOne(() => Transaction, transaction => transaction.delivery)
    @JoinColumn()
    @ApiProperty({ type: () => Transaction })
    transaction: Transaction;

    @Column()
    @ApiProperty()
    address: string;

    @Column()
    @ApiProperty()
    status: string;
}
