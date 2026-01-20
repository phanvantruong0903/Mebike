import { IsNumber, IsString, IsNotEmpty, IsPositive } from 'class-validator';

export class DebitDto {
  @IsString()
  @IsNotEmpty()
  accountId!: string;

  @IsNumber()
  @IsNotEmpty()
  @IsPositive()
  amount!: number;
}
