import { PartialType } from '@nestjs/mapped-types';
import { CreatePackageDto } from './CreatePackageDto';

export class UpdatePackageDto extends PartialType(CreatePackageDto) {}
