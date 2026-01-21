import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class GetWithdrawDetailDto {
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  id!: string;
}
