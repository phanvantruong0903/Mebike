import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateBinDto {
  @IsString()
  @IsNotEmpty()
  rackId!: string;

  @IsString()
  @IsNotEmpty()
  code!: string;

  @IsNumber()
  @IsNotEmpty()
  xCoord!: number;

  @IsNumber()
  @IsNotEmpty()
  yCoord!: number;

  @IsNumber()
  @IsNotEmpty()
  maxWeight!: number;

  @IsNumber()
  @IsNotEmpty()
  maxVolume!: number;
}
