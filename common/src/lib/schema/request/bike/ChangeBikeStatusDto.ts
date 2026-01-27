import { IsNotEmpty, IsString, IsIn, IsUUID } from 'class-validator';
import { BikeStatus } from '../../../prisma/index';

export class ChangeBikeStatusDto {
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  id!: string;

  @IsNotEmpty()
  @IsIn([
    BikeStatus.Available,
    BikeStatus.Booked,
    BikeStatus.Broken,
    BikeStatus.Reserved,
    BikeStatus.Maintained,
    BikeStatus.Unavailable,
  ])
  status!: BikeStatus;
}
