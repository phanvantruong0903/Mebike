import { PartialType, PickType } from '@nestjs/mapped-types';
import { CreateUserDto } from './CreateUserDto';

export class UpdateUserDto extends PartialType(
  PickType(CreateUserDto, ['password'] as const),
) {}
