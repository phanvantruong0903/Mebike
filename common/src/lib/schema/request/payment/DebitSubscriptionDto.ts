import { IsString, IsNotEmpty } from 'class-validator';
import { DebitDto } from './DebitDto';

export class DebitSubscriptionDto extends DebitDto {
  @IsString()
  @IsNotEmpty()
  subscriptionId!: string;
}
