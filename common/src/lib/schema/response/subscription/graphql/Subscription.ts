import { Field, ID, Int, ObjectType } from '@nestjs/graphql';
import { SubscriptionStatus } from '../../../../prisma/index';
import { UserProfile } from '../../user';
import { Package } from '../../package';
import { IsoDateScalar } from '../../../../graphql/index';

@ObjectType('SubscriptionData')
export class Subscription {
  @Field(() => ID)
  id!: string;

  @Field(() => UserProfile, { nullable: true })
  user?: UserProfile;

  @Field(() => Package, { nullable: true })
  package?: Package;

  @Field(() => IsoDateScalar, { nullable: true })
  activatedAt?: string;

  @Field(() => IsoDateScalar, { nullable: true })
  expiredAt?: string;

  @Field(() => Int, { nullable: true })
  usageCounts?: number;

  @Field(() => SubscriptionStatus)
  status!: SubscriptionStatus;

  @Field(() => IsoDateScalar)
  createdAt!: string;

  @Field(() => IsoDateScalar)
  updatedAt!: string;
}
