import { Min, IsNumber, IsString, IsNotEmpty, Max } from 'class-validator';

export class DebitDto {
  @IsString()
  @IsNotEmpty()
  accountId!: string;

  @IsNumber()
  @IsNotEmpty()
  @Min(2000, { message: 'Amount must be at least 2000' })
  @Max(100000000, { message: 'Amount must be at most 100000000' })
  amount!: number;
}
