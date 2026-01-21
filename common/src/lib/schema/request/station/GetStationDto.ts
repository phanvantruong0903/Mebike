import { Min, Max, IsNumber, IsOptional, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { StationStatus } from '../../../prisma';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class GetStationDto {
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
    description: 'Latitude for location-based search',
    example: 10.762622,
    minimum: -85.05,
    maximum: 85.05,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(-85.05, { message: 'Latitude must be at least -85.05' })
  @Max(85.05, { message: 'Latitude must be at most 90' })
  latitude?: number;

  @ApiPropertyOptional({
    description: 'Longitude for location-based search',
    example: 106.660172,
    minimum: -180,
    maximum: 180,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(-180, { message: 'Longitude must be at least -180' })
  @Max(180, { message: 'Longitude must be at most 180' })
  longitude?: number;

  @ApiPropertyOptional({
    description: 'Filter by station status for ADMIN',
    enum: StationStatus,
  })
  @IsOptional()
  @IsEnum(StationStatus)
  status?: StationStatus;
}
