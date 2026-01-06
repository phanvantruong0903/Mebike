import { Field, Float, ID, Int, ObjectType } from '@nestjs/graphql';
import { PackageStatus, UsageType } from '../../../../prisma/index';

@ObjectType()
export class Package {
  @Field(() => ID)
  id!: string;

  @Field(() => String)
  name!: string;

  @Field(() => Float)
  price!: number;

  @Field(() => Int)
  maxUsages!: number;

  @Field(() => UsageType)
  usageType!: UsageType;

  @Field(() => PackageStatus)
  status!: PackageStatus;

  @Field()
  createdAt!: string;

  @Field()
  updatedAt!: string;
}
