import { IsString, IsNotEmpty } from 'class-validator';

export class EndRentalDto {
  @IsString()
  @IsNotEmpty()
  accountId!: string;

  @IsString()
  @IsNotEmpty()
  id!: string;

  @IsString()
  @IsNotEmpty()
  endStationId!: string;
}
