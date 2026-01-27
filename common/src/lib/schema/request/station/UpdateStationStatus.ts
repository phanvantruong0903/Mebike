import { IsString, IsNotEmpty, IsIn, IsUUID } from 'class-validator';
import { StationStatus } from '../../../prisma/index';

export class UpdateStationStatusDto {
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  id!: string;

  @IsString()
  @IsNotEmpty()
  @IsIn([StationStatus.Active, StationStatus.Inactive])
  status!: StationStatus;
}
