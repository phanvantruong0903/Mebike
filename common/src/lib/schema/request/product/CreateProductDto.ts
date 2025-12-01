import {
  IsNumber,
  IsString,
  IsBoolean,
  IsNotEmpty,
  IsPositive,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductDto {
  @IsNotEmpty()
  @IsString()
  sku!: string;

  @IsNotEmpty()
  @IsString()
  name!: string;

  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  width!: number;

  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  height!: number;

  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  length!: number;

  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  weight!: number;

  @IsOptional()
  @IsBoolean()
  isFragile?: boolean;

  @IsOptional()
  @IsBoolean()
  hasBattery?: boolean;

  @IsOptional()
  @IsBoolean()
  isHighValue?: boolean;
}
