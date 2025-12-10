import {
  IsString,
  IsNotEmpty,
  MinLength,
  Min,
  Max,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateStationDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(5, { message: 'Name must be at least 3 characters' })
  name!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(10, { message: 'Address must be at least 10 characters' })
  address!: string;

  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  @Min(-85.05, { message: 'Latitude must be at least -85.05' })
  @Max(85.05, { message: 'Latitude must be at most 90' })
  latitude!: number;

  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  @Min(-180, { message: 'Longitude must be at least -180' })
  @Max(180, { message: 'Longitude must be at most 180' })
  longitude!: number;

  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  @Min(1, { message: 'Capacity must be at least 1' })
  capacity!: number;
}
