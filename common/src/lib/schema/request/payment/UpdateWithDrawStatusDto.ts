import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsIn,
  IsUUID,
} from 'class-validator';
import { WithdrawStatus } from '../../../prisma/payment/generated';

export class UpdateWithDrawStatusDto {
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  id!: string;

  @IsString()
  @IsNotEmpty()
  @IsIn([
    WithdrawStatus.COMPLETED,
    WithdrawStatus.APPROVED,
    WithdrawStatus.REJECTED,
  ])
  status!: WithdrawStatus;

  @IsString()
  @IsOptional()
  reason?: string;
}
