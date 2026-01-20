import { PartialType } from '@nestjs/mapped-types';
import { CreatePackageDto } from './CreatePackageDto';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdatePackageDto extends PartialType(CreatePackageDto) {
  @IsString()
  @IsNotEmpty()
  id!: string;
}
