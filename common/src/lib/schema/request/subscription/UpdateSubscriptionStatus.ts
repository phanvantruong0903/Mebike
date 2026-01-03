import { IsString, IsNotEmpty, IsIn } from 'class-validator';
import { SubscriptionStatus } from '../../../prisma/index';

export class UpdateSubscriptionStatusDto {
  @IsString()
  @IsNotEmpty()
  id!: string;

  @IsString()
  @IsNotEmpty()
  @IsIn([SubscriptionStatus.Active, SubscriptionStatus.Inactive])
  status!: SubscriptionStatus;
}
