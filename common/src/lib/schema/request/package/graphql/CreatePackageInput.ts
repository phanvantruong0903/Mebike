import { Field, Float, Int } from '@nestjs/graphql';
import { PackageStatus, UsageType } from '../../../../prisma';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  ValidateIf,
} from 'class-validator';

export class CreatePackageInput {
  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  name!: string;

  @Field(() => Float)
  @IsString()
  @IsNotEmpty()
  price!: number;

  @Field(() => UsageType, { defaultValue: UsageType.Finite })
  @IsEnum(UsageType)
  @IsOptional()
  usageType?: UsageType = UsageType.Finite;

  @Field(() => Int, { nullable: true })
  @ValidateIf((o) => o.usageType !== UsageType.Infinite)
  @IsInt()
  @IsPositive()
  maxUsages?: number;

  @Field(() => PackageStatus, { defaultValue: PackageStatus.Active })
  @IsEnum(PackageStatus)
  @IsOptional()
  status?: PackageStatus = PackageStatus.Active;
}
