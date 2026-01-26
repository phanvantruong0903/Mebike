import {
  Field,
  Float,
  ID,
  Int,
  ObjectType,
  GraphQLISODateTime,
} from '@nestjs/graphql';
import { Station } from '../../station';
import { RentalStatus } from '../../../../prisma/index';
import { Bike } from '../../bike';
import { UserProfile } from '../../user';
import { Subscription } from '../../subscription';
import { Transform } from 'class-transformer';

@ObjectType()
export class Rental {
  @Field(() => ID)
  id!: string;

  @Field(() => UserProfile, { nullable: true })
  user?: UserProfile;

  @Field(() => Bike, { nullable: true })
  bike?: Bike;

  @Field(() => Station, { nullable: true })
  startStation?: Station;

  @Field(() => Station, { nullable: true })
  endStation?: Station;

  @Field(() => GraphQLISODateTime)
  startTime!: Date;

  @Field(() => String, { nullable: true })
  endTime?: string;

  @Field(() => Int)
  duration!: number;

  @Field(() => Float)
  totalPrice!: number;

  @Field(() => Subscription, { nullable: true })
  subscription?: Subscription;

  @Field(() => RentalStatus)
  status!: RentalStatus;

  @Field(() => GraphQLISODateTime)
  @Transform(({ value }) => (value ? new Date(value) : null))
  createdAt!: Date;

  @Field(() => GraphQLISODateTime)
  @Transform(({ value }) => (value ? new Date(value) : null))
  updatedAt!: Date;
}
