import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ZoneType } from '../../../prisma/index';

export class UpdateZoneDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsEnum(ZoneType)
  @IsOptional()
  type?: ZoneType;
}
