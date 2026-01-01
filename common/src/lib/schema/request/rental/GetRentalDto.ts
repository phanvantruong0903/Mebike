import { IsNotEmpty, IsString } from 'class-validator';

export class GetRentalDto {
  @IsString()
  @IsNotEmpty()
  id!: string;
}
