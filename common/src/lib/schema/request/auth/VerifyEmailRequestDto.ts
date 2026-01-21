import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class VerifyEmailRequestDto {
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  accountId!: string;
}
