import { InputType, PartialType } from '@nestjs/graphql';
import { CreateWareHouseInput } from './CreateWareHouseInput';

@InputType()
export class UpdateWareHouseInput extends PartialType(CreateWareHouseInput) {}
