import { Field, ID, ObjectType, GraphQLISODateTime } from '@nestjs/graphql';
import { EmergencyStatus } from '../../../../prisma/index';
import { UserProfile } from '../../user';
import { Bike } from '../../bike';
import { Rental } from '../../rental';
import { Station } from '../../station';
import { Transform } from 'class-transformer';

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

  @Field(() => GraphQLISODateTime)
  @Transform(({ value }) => (value ? new Date(value) : null))
  createdAt!: Date;

  @Field(() => GraphQLISODateTime, { nullable: true })
  @Transform(({ value }) => new Date(value))
  startedAt?: Date;

  @Field(() => GraphQLISODateTime, { nullable: true })
  @Transform(({ value }) => new Date(value))
  resolvedAt?: Date;

  @Field(() => GraphQLISODateTime)
  @Transform(({ value }) => new Date(value))
  updatedAt!: Date;
}
