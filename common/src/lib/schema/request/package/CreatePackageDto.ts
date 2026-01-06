import {
  IsString,
  IsNotEmpty,
  IsOptional,
  ValidateIf,
  IsInt,
  IsPositive,
  IsEnum,
  IsNumber,
} from 'class-validator';
import { PackageStatus, UsageType } from '../../../prisma';

export class CreatePackageDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsNumber()
  @IsNotEmpty()
  price!: number;

  @IsEnum(UsageType)
  @IsOptional()
  usageType?: UsageType = UsageType.Finite;

  @ValidateIf((o) => o.usageType !== UsageType.Infinite)
  @IsInt()
  @IsPositive()
  maxUsages?: number;

  @IsEnum(PackageStatus)
  @IsOptional()
  status?: PackageStatus = PackageStatus.Active;
}
