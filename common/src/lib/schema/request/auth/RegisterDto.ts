import { OmitType } from '@nestjs/mapped-types';
import { CreateUserDto } from './CreateUserDto';

export class RegisterDto extends OmitType(CreateUserDto, ['role'] as const) {}
