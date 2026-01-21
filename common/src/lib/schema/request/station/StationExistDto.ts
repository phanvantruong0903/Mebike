import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class StationExistDto {
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  id!: string;
}
