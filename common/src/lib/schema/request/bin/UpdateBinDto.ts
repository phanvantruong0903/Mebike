import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateBinDto {
  @IsString()
  @IsOptional()
  code?: string;

  @IsNumber()
  @IsOptional()
  xCoord?: number;

  @IsNumber()
  @IsOptional()
  yCoord?: number;

  @IsNumber()
  @IsOptional()
  maxWeight?: number;

  @IsNumber()
  @IsOptional()
  maxVolume?: number;
}
