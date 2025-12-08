import { InputType, PartialType } from '@nestjs/graphql';
import { CreateSupplierInput } from './CreateSupplierInput';

@InputType()
export class UpdateSupplierInput extends PartialType(CreateSupplierInput) {}
