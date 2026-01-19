import { IsNotEmpty, IsString, IsIn, IsUUID } from 'class-validator';
import { UserStatus } from '../../../prisma/index';

export class ChangeUserStatusDto {
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  accountId!: string;

  @IsNotEmpty()
  @IsIn([UserStatus.Active, UserStatus.Inactive])
  status!: UserStatus;
}
