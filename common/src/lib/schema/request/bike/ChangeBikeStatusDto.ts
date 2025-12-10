import { IsNotEmpty, IsString, IsIn } from 'class-validator';
import { BikeStatus } from '../../../prisma/index';

export class ChangeBikeStatusDto {
  @IsString()
  @IsNotEmpty()
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
