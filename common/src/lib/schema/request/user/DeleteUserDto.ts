import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class DeleteUserDto {
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  accountId!: string;
}
