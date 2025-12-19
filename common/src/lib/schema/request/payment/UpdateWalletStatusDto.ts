import { IsNotEmpty, IsString, IsIn } from 'class-validator';
import { WalletStatus } from '../../../prisma/payment/generated';

export class ChangeWalletStatusDto {
  @IsString()
  @IsNotEmpty()
  id!: string;

  @IsNotEmpty()
  @IsIn([WalletStatus.ACTIVE, WalletStatus.BLOCKED])
  status!: WalletStatus;
}
