import { IsNotEmpty, IsString, IsIn, IsUUID } from 'class-validator';
import { WalletStatus } from '../../../prisma/payment/generated';

export class ChangeWalletStatusDto {
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  id!: string;

  @IsNotEmpty()
  @IsIn([WalletStatus.ACTIVE, WalletStatus.BLOCKED])
  status!: WalletStatus;
}
