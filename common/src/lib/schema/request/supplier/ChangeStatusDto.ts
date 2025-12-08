import { IsNotEmpty, IsString, IsIn } from 'class-validator';
import { SupplierStatus } from '../../../prisma/index';

export class ChangeSupplierStatusDto {
  @IsString()
  @IsNotEmpty()
  id!: string;

  @IsNotEmpty()
  @IsIn([SupplierStatus.Active, SupplierStatus.Inactive])
  status!: SupplierStatus;
}
