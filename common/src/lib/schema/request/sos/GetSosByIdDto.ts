import { IsUUID } from 'class-validator';

export class GetSosByIdDto {
  @IsUUID()
  id!: string;
}
