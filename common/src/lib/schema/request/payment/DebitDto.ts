import {
  Min,
  IsNumber,
  IsString,
  IsNotEmpty,
  Max,
  IsIn,
} from 'class-validator';
import { TransactionType } from '../../../prisma/payment/generated';

export class DebitDto {
  @IsString()
  @IsNotEmpty()
  accountId!: string;

  @IsNumber()
  @IsNotEmpty()
  @Min(2000, { message: 'Amount must be at least 2000' })
  @Max(100000000, { message: 'Amount must be at most 100000000' })
  amount!: number;

  @IsNotEmpty()
  @IsIn([
    TransactionType.REFUND,
    TransactionType.RENTALFEE,
    TransactionType.TOPUP,
    TransactionType.WITHDRAWAL,
  ])
  transactionType!: TransactionType;
}
