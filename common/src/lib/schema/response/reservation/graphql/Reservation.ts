import { Field, Float, ID, ObjectType } from '@nestjs/graphql';
import { Station } from '../../station';
import { ReservationStatus } from '../../../../prisma/index';
import { Bike } from '../../bike';
import { UserProfile } from '../../user';
import { Subscription } from '../../subscription';
import { IsoDateScalar } from '../../../../graphql/iso-date.scalar';

@ObjectType()
export class Reservation {
  @Field(() => ID)
  id!: string;

  @Field(() => UserProfile, { nullable: true })
  user?: UserProfile;

  @Field(() => Bike, { nullable: true })
  bike?: Bike;

  @Field(() => Station, { nullable: true })
  station?: Station;

  @Field()
  startTime!: string;

  @Field(() => String, { nullable: true })
  endTime?: string;

  @Field(() => Float)
  prepaid!: number;

  @Field(() => Subscription, { nullable: true })
  subscription?: Subscription;

  @Field(() => ReservationStatus)
  status!: ReservationStatus;

  @Field(() => IsoDateScalar)
  createdAt!: string;

  @Field(() => IsoDateScalar)
  updatedAt!: string;
}
