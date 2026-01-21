import {
  IsNotEmpty,
  IsNumber,
  IsString,
  IsUUID,
  IsIP,
  Min,
} from 'class-validator';

export class CreatePaymentUrlDto {
  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  amount!: number;

  @IsString()
  @IsNotEmpty()
  @IsIP()
  ipAddr!: string;

  @IsString()
  @IsNotEmpty()
  @IsUUID()
  accountId!: string;
}
