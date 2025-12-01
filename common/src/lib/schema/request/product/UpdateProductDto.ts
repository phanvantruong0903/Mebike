import { PartialType } from '@nestjs/mapped-types';
import { CreateProductDto } from './CreateProductDto';

export class UpdateProductDto extends PartialType(CreateProductDto) {}
