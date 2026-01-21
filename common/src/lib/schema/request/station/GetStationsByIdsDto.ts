import { IsArray, ArrayNotEmpty, IsUUID } from 'class-validator';

export class GetStationsByIdsDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsUUID('all', { each: true })
  ids!: string[];
}
