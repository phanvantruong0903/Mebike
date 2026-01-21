import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class GetStationDetailDto {
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  id!: string;
}
