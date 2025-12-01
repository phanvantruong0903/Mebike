import { IsOptional, IsString } from 'class-validator';
import { WarehouseStatus } from '../../../prisma';

export class UpdateWarehouseDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  location?: string;

  @IsOptional()
  status?: WarehouseStatus;
}
