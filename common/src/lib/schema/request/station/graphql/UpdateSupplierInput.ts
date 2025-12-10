import { InputType, PartialType } from '@nestjs/graphql';
import { CreateStationInput } from './CreateStrationInput';

@InputType()
export class UpdateStationInput extends PartialType(CreateStationInput) {}
