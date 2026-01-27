import { Type } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDate,
  Validate,
} from 'class-validator';
import { IsFutureDateConstraint } from '../../../utils';
import { RESERVATION_MESSAGES } from '../../../constants';

export class CreateReservationDto {
  @IsString()
  @IsNotEmpty()
  accountId!: string;

  @IsString()
  @IsNotEmpty()
  bikeId!: string;

  @Type(() => Date)
  @IsDate()
  @Validate(IsFutureDateConstraint, {
    message: RESERVATION_MESSAGES.FUTURE_START_TIME,
  })
  @IsNotEmpty()
  startTime!: Date;

  @IsString()
  @IsOptional()
  subscriptionId?: string;
}
