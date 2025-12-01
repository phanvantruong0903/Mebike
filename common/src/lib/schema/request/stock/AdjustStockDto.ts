import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class AdjustStockDto {
  @IsString()
  @IsNotEmpty()
  binId!: string;

  @IsString()
  @IsNotEmpty()
  productId!: string;

  @IsNumber()
  @IsNotEmpty()
  quantityChange!: number;

  @IsString()
  @IsNotEmpty()
  reason!: string;
}
