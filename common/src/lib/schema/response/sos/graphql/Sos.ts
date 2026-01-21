import { Field, ID, ObjectType } from '@nestjs/graphql';
import { EmergencyStatus } from '../../../../prisma/index';
import { UserProfile } from '../../user';
import { Bike } from '../../bike';
import { Rental } from '../../rental';
import { Station } from '../../station';

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

  @Field(() => String)
  createdAt!: string;

  @Field(() => String, { nullable: true })
  startedAt?: string;

  @Field(() => String, { nullable: true })
  resolvedAt?: string;

  @Field(() => String)
  updatedAt!: string;
}
