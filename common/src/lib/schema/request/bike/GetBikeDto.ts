import { Min, IsNumber, IsOptional, IsEnum, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';
import { BikeStatus } from '../../../prisma';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class GetBikeDto {
  @ApiPropertyOptional({
    description: 'Page number',
    example: 1,
    minimum: 1,
    default: 1,
  })
  @IsOptional()
  @IsNumber()
  @Min(1, { message: 'Page must be at least 1' })
  @Type(() => Number)
  page?: number;

  @ApiPropertyOptional({
    description: 'Number of items per page',
    example: 10,
    minimum: 1,
    default: 10,
  })
  @IsOptional()
  @IsNumber()
  @Min(1, { message: 'Limit must be at least 1' })
  @Type(() => Number)
  limit?: number;

  @ApiPropertyOptional({
    description: 'Filter by bike status',
    enum: BikeStatus,
  })
  @IsOptional()
  @IsEnum(BikeStatus)
  status?: BikeStatus;

  @ApiPropertyOptional({ description: 'Filter by station ID', format: 'uuid' })
  @IsOptional()
  @IsUUID()
  stationId?: string;

  @ApiPropertyOptional({ description: 'Filter by supplier ID', format: 'uuid' })
  @IsOptional()
  @IsUUID()
  supplierId?: string;
}
