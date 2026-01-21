import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class GetSupplierDetailDto {
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  id!: string;
}
