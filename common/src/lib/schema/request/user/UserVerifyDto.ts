import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class UserVerifyDto {
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  accountId!: string;
}
