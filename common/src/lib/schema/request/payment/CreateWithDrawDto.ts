import {
  IsNumber,
  IsString,
  IsNumberString,
  Min,
  Max,
  IsNotEmpty,
  IsOptional,
} from 'class-validator';

export class CreateWithDrawDto {
  @IsString()
  @IsNotEmpty()
  accountId!: string;

  @IsString()
  @IsNotEmpty()
  bank!: string;

  @IsString()
  @IsNotEmpty()
  accountOwner!: string;

  @IsString()
  @IsNumberString({}, { message: 'Account number must be a number' })
  accountNumber!: string;

  @IsNumber()
  @IsNotEmpty()
  @Min(2000, { message: 'Amount must be at least 2000' })
  @Max(100000000, { message: 'Amount must be at most 100000000' })
  amount!: number;

  @IsString()
  @IsOptional()
  note?: string;
}
