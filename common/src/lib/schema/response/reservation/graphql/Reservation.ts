import { Field, Float, ID, ObjectType } from '@nestjs/graphql';
import { Station } from '../../station';
import { ReservationStatus } from '../../../../prisma/index';
import { Bike } from '../../bike';

@ObjectType()
export class Reservation {
  @Field(() => ID)
  id!: string;

  @Field(() => ID)
  userId!: string;

  @Field(() => ID, { nullable: true })
  bikeId?: string;

  @Field(() => Bike, { nullable: true })
  bike?: Bike;

  @Field(() => ID, { nullable: true })
  stationId?: string;

  @Field(() => Station, { nullable: true })
  station?: Station;

  @Field()
  startTime!: string;

  @Field(() => String, { nullable: true })
  endTime?: string;

  @Field(() => Float)
  prepaid!: number;

  @Field(() => ID, { nullable: true })
  subscriptionId?: string;

  @Field(() => String, { nullable: true })
  subscription?: string; // adjust after subscription-service added

  @Field(() => ReservationStatus)
  status!: ReservationStatus;

  @Field()
  createdAt!: string;

  @Field()
  updatedAt!: string;
}
