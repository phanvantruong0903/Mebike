import { Type } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDate,
  MinDate,
} from 'class-validator';

export class CreateReservationDto {
  @IsString()
  @IsNotEmpty()
  accountId!: string;

  @IsString()
  @IsNotEmpty()
  bikeId!: string;

  @Type(() => Date)
  @IsDate()
  @MinDate(new Date())
  @IsNotEmpty()
  startTime!: Date;

  @IsString()
  @IsOptional()
  subscriptionId?: string;
}
