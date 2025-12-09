import { PartialType } from '@nestjs/mapped-types';
import { CreateStationDto } from './CreateStationDto';

export class UpdateStationDto extends PartialType(CreateStationDto) {}
