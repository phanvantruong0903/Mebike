import { IsString, IsNotEmpty } from 'class-validator';

export class ActivateSubscriptionDto {
  @IsString()
  @IsNotEmpty()
  accountId!: string;

  @IsString()
  @IsNotEmpty()
  id!: string;
}
