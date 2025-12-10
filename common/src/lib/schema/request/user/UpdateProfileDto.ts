import {
  IsOptional,
  IsString,
  IsInt,
  Min,
  MinLength,
  IsNotEmpty,
} from 'class-validator';

export class UpdateProfileDto {
  @IsNotEmpty()
  @IsString()
  id!: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsInt()
  @Min(1900)
  YOB?: number;

  @IsOptional()
  @IsString()
  @MinLength(10, { message: 'Phone must be at least 10 characters' })
  phone?: string;
}
