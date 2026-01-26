import {
  Field,
  ID,
  Int,
  ObjectType,
  GraphQLISODateTime,
} from '@nestjs/graphql';
import { SubscriptionStatus } from '../../../../prisma/index';
import { UserProfile } from '../../user';
import { Package } from '../../package';
import { Transform } from 'class-transformer';

@ObjectType('SubscriptionData')
export class Subscription {
  @Field(() => ID)
  id!: string;

  @Field(() => UserProfile, { nullable: true })
  user?: UserProfile;

  @Field(() => Package, { nullable: true })
  package?: Package;

  @Field(() => GraphQLISODateTime, { nullable: true })
  activatedAt?: Date;

  @Field(() => GraphQLISODateTime, { nullable: true })
  expiredAt?: Date;

  @Field(() => Int, { nullable: true })
  usageCounts?: number;

  @Field(() => SubscriptionStatus)
  status!: SubscriptionStatus;

  @Field(() => GraphQLISODateTime)
  @Transform(({ value }) => (value ? new Date(value) : null))
  createdAt!: Date;

  @Field(() => GraphQLISODateTime)
  @Transform(({ value }) => (value ? new Date(value) : null))
  updatedAt!: Date;
}
