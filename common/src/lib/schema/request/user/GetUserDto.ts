import { Min, IsNumber, IsOptional, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { UserStatus } from '../../../prisma';

export class GetUserDto {
  @IsNumber()
  @Min(1, { message: 'Page must be at least 1' })
  @Type(() => Number)
  page!: number;

  @IsNumber()
  @Min(1, { message: 'Limit must be at least 1' })
  @Type(() => Number)
  limit!: number;

  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;
}
