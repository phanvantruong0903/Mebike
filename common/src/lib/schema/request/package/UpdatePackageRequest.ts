import { PartialType } from '@nestjs/mapped-types';
import { CreatePackageDto } from './CreatePackageDto';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdatePackageRequest extends PartialType(CreatePackageDto) {
  @IsNotEmpty()
  @IsString()
  id!: string;
}
