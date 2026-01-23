import { Field, InputType, Int } from '@nestjs/graphql';
import { PackageStatus, UsageType } from '../../../../prisma';

@InputType()
export class CreatePackageInput {
  @Field(() => String, { nullable: true })
  name?: string;

  @Field(() => Number, { nullable: true })
  price?: number;

  @Field(() => UsageType, { defaultValue: UsageType.Finite, nullable: true })
  usageType?: UsageType;

  @Field(() => Int, { nullable: true })
  maxUsages?: number;

  @Field(() => PackageStatus, {
    defaultValue: PackageStatus.Active,
    nullable: true,
  })
  status?: PackageStatus;
}
