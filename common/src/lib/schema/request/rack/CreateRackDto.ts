import { IsNotEmpty, IsString } from 'class-validator';

export class CreateRackDto {
  @IsString()
  @IsNotEmpty()
  zoneId!: string;

  @IsString()
  @IsNotEmpty()
  code!: string;
}
