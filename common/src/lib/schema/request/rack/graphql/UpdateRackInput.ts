import { InputType, OmitType, PartialType } from '@nestjs/graphql';
import { CreateRackInput } from './CreateRackInput';

@InputType()
export class UpdateRackInput extends PartialType(
  OmitType(CreateRackInput, ['zoneId']),
) {}
