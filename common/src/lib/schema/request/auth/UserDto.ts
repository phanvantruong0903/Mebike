import { PartialType, PickType } from '@nestjs/mapped-types';
import { CreateUserDto } from './CreateUserDto';

export class UserDto extends PartialType(
  PickType(CreateUserDto, ['email', 'password'] as const),
) {}
