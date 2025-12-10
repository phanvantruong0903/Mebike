import { IsString, IsNotEmpty, MinLength } from 'class-validator';

export class CreateBikeDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(5, { message: 'ChipID must be at least 5 characters' })
  chipId!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(10, { message: 'StationID must be at least 10 characters' })
  stationId!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(10, { message: 'SupplierID must be at least 10 characters' })
  supplierId!: string;
}
