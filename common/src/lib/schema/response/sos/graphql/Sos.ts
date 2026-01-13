import { Field, ID, ObjectType } from '@nestjs/graphql';
import { EmergencyStatus, StationStatus } from '../../../../prisma/index';

@ObjectType()
export class Sos {
  @Field(() => ID)
  id!: string;

  @Field()
  rentalId!: string;

  @Field()
  requesterId!: string;

  @Field()
  bikeId!: string;

  @Field()
  issue!: string;

  @Field(() => [String])
  photos!: string[];

  @Field(() => Boolean)
  isContinuingRental!: boolean;

  @Field(() => String)
  latitude!: string;

  @Field(() => String)
  longitude!: string;

  @Field(() => String)
  agentId!: string;

  @Field(() => String, { nullable: true })
  agentNotes?: string;

  @Field(() => String)
  stationId!: string;

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
