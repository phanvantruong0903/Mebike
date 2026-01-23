import { IsString, IsNotEmpty } from 'class-validator';

export class SubscriptionDto {
  @IsString()
  @IsNotEmpty()
  id!: string;
}
