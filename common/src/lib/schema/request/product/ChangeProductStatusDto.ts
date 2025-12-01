import { IsNotEmpty, IsString, IsIn } from 'class-validator';
import { ProductStatus } from '../../../prisma/index';

export class ChangeProductStatusDto {
  @IsString()
  @IsNotEmpty()
  id!: string;

  @IsNotEmpty()
  @IsIn([ProductStatus.ACTIVE, ProductStatus.INACTIVE])
  status!: ProductStatus;
}
