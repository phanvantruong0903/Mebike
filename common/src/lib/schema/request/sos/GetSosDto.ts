import {
  Min,
  IsNumber,
  IsOptional,
  IsEnum,
  IsUUID,
  IsIn,
} from 'class-validator';
import { Type } from 'class-transformer';
import { EmergencyStatus, Role } from '../../../prisma';

export class GetSosDto {
  @IsNumber()
  @Min(1, { message: 'Page must be at least 1' })
  @Type(() => Number)
  page!: number;

  @IsNumber()
  @Min(1, { message: 'Limit must be at least 1' })
  @Type(() => Number)
  limit!: number;

  @IsOptional()
  @IsEnum(EmergencyStatus)
  status?: EmergencyStatus;

  @IsUUID()
  accountId!: string;

  @IsEnum(Role)
  @IsIn([Role.ADMIN, Role.SOS, Role.USER])
  role!: Role;
}
