import { IsString, IsNotEmpty } from 'class-validator';

export class ConfirmReservationDto {
  @IsString()
  @IsNotEmpty()
  accountId!: string;

  @IsString()
  @IsNotEmpty()
  id!: string;
}
