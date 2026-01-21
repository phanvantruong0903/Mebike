import { IsArray, ArrayNotEmpty, IsUUID } from 'class-validator';

export class GetSuppliersByIdsDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsUUID('all', { each: true })
  ids!: string[];
}
