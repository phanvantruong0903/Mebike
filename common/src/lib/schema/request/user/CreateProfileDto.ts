import { PickType } from '@nestjs/mapped-types';
import { CreateUserDto } from '../auth/CreateUserDto';
import { IsString, IsNotEmpty, IsNotIn, MinLength } from 'class-validator';
import { Role } from '../../../prisma/index';

const PickedUserFields = PickType(CreateUserDto, ['YOB', 'name']);

export class CreateProfileDto extends PickedUserFields {
  @IsString()
  @IsNotEmpty()
  accountId!: string;

  @IsNotEmpty()
  @MinLength(10, { message: 'Phone must be at least 10 characters' })
  phone!: string;

  @IsNotEmpty()
  @IsNotIn([Role.ADMIN], { message: 'Role must not be ADMIN' })
  role!: Role;

  workStationId?: string;
}
