import { Field, ID, ObjectType } from '@nestjs/graphql';
import { EmergencyStatus } from '../../../../prisma/index';
import { UserProfile } from '../../user';
import { Bike } from '../../bike';
import { Rental } from '../../rental';
import { Station } from '../../station';
import { IsoDateScalar } from '../../../../graphql/index';

@ObjectType()
export class Sos {
  @Field(() => ID)
  id!: string;

  @Field()
  rentalId!: string;

  @Field(() => Rental, { nullable: true })
  rental?: Rental;

  @Field()
  requesterId!: string;

  @Field(() => UserProfile, { nullable: true })
  requester?: UserProfile;

  @Field()
  bikeId!: string;

  @Field(() => Bike, { nullable: true })
  bike?: Bike;

  @Field()
  issue!: string;

  @Field(() => [String])
  photos!: string[];

  @Field(() => [String], { nullable: true })
  resolvedPhotos?: string[];

  @Field(() => Boolean)
  isContinuingRental!: boolean;

  @Field(() => String)
  latitude!: string;

  @Field(() => String)
  longitude!: string;

  @Field(() => String)
  agentId!: string;

  @Field(() => UserProfile, { nullable: true })
  agent?: UserProfile;

  @Field(() => String, { nullable: true })
  agentNotes?: string;

  @Field(() => String)
  stationId!: string;

  @Field(() => Station, { nullable: true })
  station?: Station;

  @Field(() => EmergencyStatus)
  status!: EmergencyStatus;

  @Field(() => IsoDateScalar)
  createdAt!: string;

  @Field(() => IsoDateScalar, { nullable: true })
  startedAt?: string;

  @Field(() => IsoDateScalar, { nullable: true })
  resolvedAt?: string;

  @Field(() => IsoDateScalar)
  updatedAt!: string;
}
