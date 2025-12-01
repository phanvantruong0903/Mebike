import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { ZoneType } from '../../../prisma/index';

export class CreateZoneDto {
  @IsString()
  @IsNotEmpty()
  wareHouseId!: string;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsEnum(ZoneType)
  @IsNotEmpty()
  type!: ZoneType;
}
