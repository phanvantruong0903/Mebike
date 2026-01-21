import { IsString, IsNotEmpty } from 'class-validator';

export class ByIdDto {
  @IsString()
  @IsNotEmpty()
  id!: string;
}
