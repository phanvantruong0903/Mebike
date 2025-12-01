import { InputType, PartialType } from '@nestjs/graphql';
import { CreateProductInput } from './CreateProductInput';

@InputType()
export class UpdateProductInput extends PartialType(CreateProductInput) {}
