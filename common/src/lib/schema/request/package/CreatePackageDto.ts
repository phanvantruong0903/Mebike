import {
  IsString,
  IsNotEmpty,
  IsOptional,
  ValidateIf,
  IsInt,
  IsPositive,
  IsEnum,
} from 'class-validator';
import { PackageStatus, UsageType } from 'src/lib/prisma/rental/generated';

export class CreatePackageDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
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
