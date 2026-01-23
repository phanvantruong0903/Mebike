import { IsString, IsNotEmpty, IsBoolean, IsOptional } from 'class-validator';

export class CreateSubscriptionDto {
  @IsString()
  @IsNotEmpty()
  accountId!: string;

  @IsString()
  @IsNotEmpty()
  packageId!: string;

  @IsBoolean()
  @IsOptional()
  isActivated?: boolean = false;
}
