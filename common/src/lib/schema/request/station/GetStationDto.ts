import { Min, Max, IsNumber, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class GetStationDto {
  @IsNumber()
  @Min(1, { message: 'Page must be at least 1' })
  @Type(() => Number)
  page!: number;

  @IsNumber()
  @Min(1, { message: 'Limit must be at least 1' })
  @Type(() => Number)
  limit!: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(-85.05, { message: 'Latitude must be at least -85.05' })
  @Max(85.05, { message: 'Latitude must be at most 90' })
  latitude?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(-180, { message: 'Longitude must be at least -180' })
  @Max(180, { message: 'Longitude must be at most 180' })
  longitude?: number;
}
