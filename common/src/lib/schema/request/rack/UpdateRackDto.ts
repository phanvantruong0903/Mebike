import { IsOptional, IsString } from 'class-validator';

export class UpdateRackDto {
  @IsString()
  @IsOptional()
  code?: string;
}
