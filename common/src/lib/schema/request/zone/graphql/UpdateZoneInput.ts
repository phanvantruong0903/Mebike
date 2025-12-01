import { InputType, OmitType, PartialType } from '@nestjs/graphql';
import { CreateZoneInput } from './CreateZoneInput';

@InputType()
export class UpdateZoneInput extends PartialType(
  OmitType(CreateZoneInput, ['wareHouseId']),
) {}
