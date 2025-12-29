import { IsString, IsNotEmpty, IsIn } from 'class-validator';
import { StationStatus } from '../../../prisma/index';

export class UpdateStationStatusDto {
  @IsString()
  @IsNotEmpty()
  id!: string;

  @IsString()
  @IsNotEmpty()
  @IsIn([StationStatus.Active, StationStatus.Inactive])
  status!: StationStatus;
}
