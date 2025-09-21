import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from '../../users/dto/CreateUserDto';

export class UpdateUserDto extends PartialType(
  OmitType(CreateUserDto, ['password'] as const)
) {}
