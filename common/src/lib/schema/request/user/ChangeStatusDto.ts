import { IsNotEmpty, IsString, IsIn } from 'class-validator';
import { UserStatus } from '../../../prisma/index';

export class ChangeUserStatusDto {
  @IsString()
  @IsNotEmpty()
  accountId!: string;

  @IsNotEmpty()
  @IsIn([UserStatus.Active, UserStatus.Inactive])
  status!: UserStatus;
}
