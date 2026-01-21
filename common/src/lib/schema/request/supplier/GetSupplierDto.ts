import { IsNumber, IsOptional, IsEnum, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { SupplierStatus } from '../../../prisma/index';

export class GetSupplierDto {
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  page!: number;

  @IsNumber()
  @Min(1)
  @Type(() => Number)
  limit!: number;

  @IsOptional()
  @IsEnum(SupplierStatus)
  status?: SupplierStatus;
}
