import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateReservationDto {
  @IsString()
  @IsNotEmpty()
  accountId!: string;

  @IsString()
  @IsNotEmpty()
  bikeId!: string;

  @IsString()
  @IsNotEmpty()
  stationId!: string;

  @IsString()
  @IsNotEmpty()
  startTime!: string;

  @IsString()
  @IsOptional()
  subscriptionId?: string;
}
