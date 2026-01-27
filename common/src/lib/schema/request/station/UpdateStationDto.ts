import { PartialType } from '@nestjs/mapped-types';
import { CreateStationDto } from './CreateStationDto';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class UpdateStationDto extends PartialType(CreateStationDto) {
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  id!: string;
}
