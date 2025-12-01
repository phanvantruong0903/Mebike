import { InputType, PartialType } from '@nestjs/graphql';
import { CreateBinInput } from './CreateBinInput';

@InputType()
export class UpdateBinInput extends PartialType(CreateBinInput) {}
