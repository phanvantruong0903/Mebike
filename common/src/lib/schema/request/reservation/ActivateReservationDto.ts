import { IsString, IsNotEmpty } from 'class-validator';

export class ActivateReservationDto {
  @IsString()
  @IsNotEmpty()
  accountId!: string;

  @IsString()
  @IsNotEmpty()
  id!: string;
}
