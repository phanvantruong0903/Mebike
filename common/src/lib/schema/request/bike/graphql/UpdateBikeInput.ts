import { InputType, PartialType } from '@nestjs/graphql';
import { CreateBikeInput } from './CreateBikeInput';

@InputType()
export class UpdateBikeInput extends PartialType(CreateBikeInput) {}
