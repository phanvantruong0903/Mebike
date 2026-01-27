import {
  Field,
  ID,
  Int,
  ObjectType,
  GraphQLISODateTime,
} from '@nestjs/graphql';
import { PackageStatus, UsageType } from '../../../../prisma/index';
import { Transform } from 'class-transformer';

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

  @Field(() => GraphQLISODateTime)
  @Transform(({ value }) => new Date(value))
  createdAt!: Date;

  @Field(() => GraphQLISODateTime)
  @Transform(({ value }) => new Date(value))
  updatedAt!: Date;
}
