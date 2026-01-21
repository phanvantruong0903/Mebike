import { Field, ID, Int, ObjectType } from '@nestjs/graphql';
import { PackageStatus, UsageType } from '../../../../prisma/index';

@ObjectType()
export class Package {
  @Field(() => ID)
  id!: string;

  @Field(() => String)
  name!: string;

  @Field(() => String)
  price!: string;

  @Field(() => Int, { nullable: true })
  maxUsages?: number;

  @Field(() => UsageType)
  usageType!: UsageType;

  @Field(() => PackageStatus)
  status!: PackageStatus;

  @Field()
  createdAt!: string;

  @Field()
  updatedAt!: string;
}
