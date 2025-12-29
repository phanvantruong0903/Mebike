import { Field, Float, ID, Int, ObjectType } from '@nestjs/graphql';
import { Bike } from '../../bike';
import { StationStatus } from '../../../../prisma/index';

@ObjectType()
export class Station {
  @Field(() => ID)
  id!: string;

  @Field()
  name!: string;

  @Field()
  address!: string;

  @Field()
  latitude!: string;

  @Field()
  longitude!: string;

  @Field(() => Int)
  capacity!: number;

  @Field(() => Int, { nullable: true })
  totalBike?: number;

  @Field(() => Float, { nullable: true })
  distance?: number;

  @Field(() => [Bike])
  bikes!: Bike[];

  @Field()
  createdAt!: string;

  @Field()
  updatedAt!: string;

  @Field(() => StationStatus)
  status!: StationStatus;

  @Field(() => Int, { nullable: true })
  availableBike?: number;

  @Field(() => Int, { nullable: true })
  bookedBike?: number;

  @Field(() => Int, { nullable: true })
  brokenBike?: number;

  @Field(() => Int, { nullable: true })
  reservedBike?: number;

  @Field(() => Int, { nullable: true })
  maintanedBike?: number;

  @Field(() => Int, { nullable: true })
  unavailable?: number;
}
