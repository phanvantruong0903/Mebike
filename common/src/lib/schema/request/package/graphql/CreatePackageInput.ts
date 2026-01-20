import { Field, InputType, Int } from '@nestjs/graphql';
import { PackageStatus, UsageType } from '../../../../prisma';

@InputType()
export class CreatePackageInput {
  @Field(() => String)
  name!: string;

  @Field(() => Number)
  price!: number;

  @Field(() => UsageType, { defaultValue: UsageType.Finite })
  usageType?: UsageType;

  @Field(() => Int, { nullable: true })
  maxUsages?: number;

  @Field(() => PackageStatus, { defaultValue: PackageStatus.Active })
  status?: PackageStatus;
}
