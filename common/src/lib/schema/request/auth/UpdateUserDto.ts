import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './CreateUserDto';
import { IsNotEmpty, IsOptional, IsUrl } from 'class-validator';

export class UpdateUserDto extends PartialType(
  OmitType(CreateUserDto, ['email', 'role'] as const),
) {
  @IsNotEmpty()
  @IsOptional()
  address!: string;

  @IsNotEmpty()
  @IsOptional()
  @IsUrl()
  avatarUrl!: string;

  @IsNotEmpty()
  @IsOptional()
  nfcCardUid!: string;
}
