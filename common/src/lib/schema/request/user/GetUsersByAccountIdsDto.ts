import { IsArray, ArrayNotEmpty, IsUUID } from 'class-validator';

export class GetUsersByAccountIdsDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsUUID('all', { each: true })
  accountIds!: string[];
}
