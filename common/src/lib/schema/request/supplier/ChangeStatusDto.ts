import { IsNotEmpty, IsString, IsIn, IsUUID } from 'class-validator';
import { SupplierStatus } from '../../../prisma/index';

export class ChangeSupplierStatusDto {
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  id!: string;

  @IsNotEmpty()
  @IsIn([SupplierStatus.Active, SupplierStatus.Inactive])
  status!: SupplierStatus;
}
