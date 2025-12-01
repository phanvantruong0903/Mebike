import {
  IsEmail,
  IsNotEmpty,
  MinLength,
  Min,
  Max,
  IsNotIn,
} from 'class-validator';
import { Role } from '../../../prisma/index';

export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsNotEmpty()
  name!: string;

  @MinLength(6)
  @IsNotEmpty()
  password!: string;

  @IsNotEmpty()
  @Min(1900, { message: 'YOB must be greater than 1900' })
  @Max(new Date().getFullYear(), { message: 'YOB must be less than now' })
  YOB!: number;

  @IsNotEmpty()
  @IsNotIn([Role.ADMIN], { message: 'Role must not be ADMIN' })
  role!: Role;
}
