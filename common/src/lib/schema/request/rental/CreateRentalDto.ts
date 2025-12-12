import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateRentalDto {
  @IsString()
  @IsNotEmpty()
  accountId!: string;

  @IsString()
  @IsNotEmpty()
  bikeId!: string;

  @IsString()
  @IsOptional()
  subscriptionId?: string;
}
