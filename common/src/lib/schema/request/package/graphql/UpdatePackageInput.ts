import { InputType, PartialType } from '@nestjs/graphql';
import { CreatePackageInput } from './CreatePackageInput';

@InputType()
export class UpdatePackageInput extends PartialType(CreatePackageInput) {}
