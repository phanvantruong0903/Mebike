import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateRentalDto {
  @IsString()
  @IsNotEmpty({ message: 'Account ID is required' })
  accountId!: string;

  @IsString()
  @IsNotEmpty({ message: 'Bike ID is required' })
  bikeId!: string;

  @IsString()
  @IsOptional()
  subscriptionId?: string;
}
