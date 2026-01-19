import {
  IsOptional,
  IsString,
  IsInt,
  Min,
  MinLength,
  IsNotEmpty,
  IsUrl,
  IsUUID,
} from 'class-validator';

export class UpdateProfileDto {
  @IsNotEmpty()
  @IsString()
  @IsUUID()
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

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsUrl()
  avatarUrl?: string;

  @IsOptional()
  @IsString()
  nfcCardUid?: string;
}
