import {
  IsEmail,
  IsNotEmpty,
  Min,
  Max,
  IsNotIn,
  IsPhoneNumber,
} from 'class-validator';
import { Role } from '../../../prisma/index';

export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsNotEmpty()
  name!: string;

  @IsNotEmpty()
  @Min(1900, { message: 'YOB must be greater than 1900' })
  @Max(new Date().getFullYear(), { message: 'YOB must be less than now' })
  YOB!: number;

  @IsNotEmpty()
  @IsPhoneNumber('VN', { message: 'Invalid Vietnam phone number' })
  phone!: string;

  @IsNotEmpty()
  @IsNotIn([Role.ADMIN], { message: 'Role must not be ADMIN' })
  role!: Role;
}
