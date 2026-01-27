import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class GetWalletDto {
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  accountId!: string;
}
