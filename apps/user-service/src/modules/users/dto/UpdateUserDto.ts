import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './CreateUserDto';

export class UpdateUserDto extends PartialType(
  OmitType(CreateUserDto, ['password', 'email'] as const),
) {}
