import { Field, Float, ID, Int, ObjectType } from '@nestjs/graphql';
import { Bike } from '../../bike';

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

  @Field(() => Int)
  totalBike!: number;

  @Field(() => Int)
  availableBike!: number;

  @Field(() => Int)
  bookedBike!: number;

  @Field(() => Int)
  brokenBike!: number;

  @Field(() => Int)
  reservedBike!: number;

  @Field(() => Int)
  maintanedBike!: number;

  @Field(() => Int)
  unavailable!: number;

  @Field(() => Float, { nullable: true })
  distance?: number;

  @Field(() => [Bike])
  bikes!: Bike[];

  @Field()
  createdAt!: string;

  @Field()
  updatedAt!: string;
}
