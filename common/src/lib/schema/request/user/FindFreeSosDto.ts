import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class FindFreeSosDto {
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  stationId!: string;
}
