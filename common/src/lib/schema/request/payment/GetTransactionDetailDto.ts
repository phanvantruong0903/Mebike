import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class GetTransactionDetailDto {
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  id!: string;
}
