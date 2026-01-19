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
import { Transform } from 'class-transformer';

export class CreatePackageDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  price!: number;

  @IsEnum(UsageType)
  @IsOptional()
  usageType?: UsageType = UsageType.Finite;

  @ValidateIf((o) => o.usageType !== UsageType.Infinite)
  @IsInt()
  @IsPositive()
  @Transform(({ obj, value }) => {
    return obj.usageType === UsageType.Infinite ? null : value;
  })
  maxUsages?: number;

  @IsEnum(PackageStatus)
  @IsOptional()
  status?: PackageStatus = PackageStatus.Active;
}
