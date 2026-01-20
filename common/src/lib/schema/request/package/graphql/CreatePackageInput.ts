import { Field, InputType, Int } from '@nestjs/graphql';
import { PackageStatus, UsageType } from '../../../../prisma';
import { IsNotEmpty, IsNumber, Matches } from 'class-validator';

@InputType()
export class CreatePackageInput {
  @Field(() => String, { nullable: true })
  name?: string;

  @Field(() => Number, { nullable: true })
  @IsNumber()
  @IsNotEmpty()
  @Matches(/^\d*\.?\d+$/)
  price?: number;

  @Field(() => UsageType, { defaultValue: UsageType.Finite })
  usageType?: UsageType;

  @Field(() => Int, { nullable: true })
  maxUsages?: number;

  @Field(() => PackageStatus, { defaultValue: PackageStatus.Active })
  status?: PackageStatus;
}
