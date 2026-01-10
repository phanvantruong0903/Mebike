import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsString,
  IsUrl,
  IsUUID,
  Max,
  Min,
} from 'class-validator';

export class CreateSosDto {
  @IsUUID()
  rentalId!: string;

  @IsUUID()
  requesterId!: string;

  @IsUUID()
  bikeId!: string;

  @IsString()
  @IsNotEmpty()
  issue!: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  @IsUrl({}, { each: true })
  photos!: string[];

  @IsBoolean()
  isContinuingRental!: boolean;

  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  @Min(-85.05, { message: 'Latitude must be at least -85.05' })
  @Max(85.05, { message: 'Latitude must be at most 85.05' })
  latitude!: number;

  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  @Min(-180, { message: 'Longitude must be at least -180' })
  @Max(180, { message: 'Longitude must be at most 180' })
  longitude!: number;
}
