import { Field, Float, InputType, Int } from '@nestjs/graphql';
import { PackageStatus, UsageType } from '../../../../prisma';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsPositive,
  IsString,
  Matches,
  ValidateIf,
} from 'class-validator';

@InputType()
export class CreatePackageInput {
  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  name!: string;

  @Field(() => String)
  @IsNumberString()
  @IsNotEmpty()
  @Matches(/^\d*\.?\d+$/)
  price!: string;

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
