import { IsArray, ArrayNotEmpty, IsUUID } from 'class-validator';

export class GetBikesByIdsDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsUUID('all', { each: true })
  ids!: string[];
}
