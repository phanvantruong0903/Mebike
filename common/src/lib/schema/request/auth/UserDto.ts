import { PartialType, PickType } from '@nestjs/mapped-types';
import { IsBoolean, IsOptional } from 'class-validator';
import { RegisterUserDto } from './RegisterUserDto';

export class UserDto extends PartialType(
  PickType(RegisterUserDto, ['email', 'password'] as const),
) {
  @IsBoolean()
  @IsOptional()
  isFirstLogin?: boolean;
}
