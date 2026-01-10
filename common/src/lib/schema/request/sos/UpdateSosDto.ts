import { PartialType, PickType } from '@nestjs/mapped-types';
import { CreateSosDto } from './CreateSosDto';

export class UpdateSosDto extends PartialType(
  PickType(CreateSosDto, [
    'isContinuingRental',
    'issue',
    'latitude',
    'longitude',
    'photos',
  ]),
) {}
