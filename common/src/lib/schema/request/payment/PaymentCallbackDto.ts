import { IsNotEmpty, IsNumber, IsString, IsUUID } from 'class-validator';

export class PaymentCallbackDto {
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  accountId!: string;

  @IsNumber()
  @IsNotEmpty()
  amount!: number;

  @IsString()
  @IsNotEmpty()
  description!: string;
}
