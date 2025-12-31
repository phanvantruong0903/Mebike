import { Field, Float, ID, Int, ObjectType } from '@nestjs/graphql';
import { Station } from '../../station';
import { RentalStatus } from '../../../../prisma/index';
import { Bike } from '../../bike';

@ObjectType()
export class Rental {
  @Field(() => ID)
  id!: string;

  @Field(() => ID)
  userId!: string;

  @Field(() => ID, { nullable: true })
  bikeId?: string;

  @Field(() => Bike, { nullable: true })
  bike?: Bike;

  @Field(() => ID)
  startStationId!: string;

  @Field(() => Station, { nullable: true })
  startStation?: Station;

  @Field(() => ID, { nullable: true })
  endStationId?: string;

  @Field(() => Station, { nullable: true })
  endStation?: Station;

  @Field()
  startTime!: string;

  @Field(() => String, { nullable: true })
  endTime?: string;

  @Field(() => Int)
  duration!: number;

  @Field(() => Float)
  totalPrice!: number;

  @Field(() => ID, { nullable: true })
  subscriptionId?: string;

  @Field(() => String, { nullable: true })
  subscription?: string; // adjust after subscription-service added

  @Field(() => RentalStatus)
  status!: RentalStatus;

  @Field()
  createdAt!: string;

  @Field()
  updatedAt!: string;
}
