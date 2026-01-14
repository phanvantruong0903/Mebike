import { Type } from 'class-transformer';
import { IsString, IsNotEmpty, IsOptional, IsDate } from 'class-validator';

export class CreateReservationDto {
  @IsString()
  @IsNotEmpty()
  accountId!: string;

  @IsString()
  @IsNotEmpty()
  bikeId!: string;

  @Type(() => Date)
  @IsDate()
  @IsNotEmpty()
  startTime!: Date;

  @IsString()
  @IsOptional()
  subscriptionId?: string;
}
