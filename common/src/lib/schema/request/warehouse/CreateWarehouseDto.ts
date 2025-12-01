import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { WarehouseStatus } from '../../../prisma';

export class CreateWarehouseDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  location!: string;

  @IsOptional()
  status?: WarehouseStatus;
}
