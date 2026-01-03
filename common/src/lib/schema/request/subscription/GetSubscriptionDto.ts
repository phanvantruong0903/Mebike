import { IsString } from 'class-validator';

export class GetSubscriptionDto {
  @IsString()
  id!: string;
}
