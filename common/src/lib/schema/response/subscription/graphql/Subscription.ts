import { Field, ID, Int, ObjectType } from '@nestjs/graphql';
import { SubscriptionStatus } from '../../../../prisma/index';
import { UserProfile } from '../../user';
import { Package } from '../../package';

@ObjectType('SubscriptionData')
export class Subscription {
  @Field(() => ID)
  id!: string;

  @Field(() => UserProfile, { nullable: true })
  user?: UserProfile;

  @Field(() => Package, { nullable: true })
  package?: Package;

  @Field(() => String, { nullable: true })
  activatedAt?: string;

  @Field(() => String, { nullable: true })
  expiredAt?: string;

  @Field(() => Int, { nullable: true })
  usageCounts?: number;

  @Field(() => SubscriptionStatus)
  status!: SubscriptionStatus;

  @Field()
  createdAt!: string;

  @Field()
  updatedAt!: string;
}
