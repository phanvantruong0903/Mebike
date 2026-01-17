import { Field, ObjectType } from '@nestjs/graphql';
import { StationStatus } from '../../../../prisma';
import { Bike } from '../../bike';

@ObjectType()
export class StationSearchResult {
  @Field()
  id!: string;

  @Field()
  name!: string;

  @Field()
  address!: string;

  @Field()
  latitude!: string;

  @Field()
  longitude!: string;

  @Field(() => Number)
  capacity!: number;

  @Field(() => StationStatus)
  status!: StationStatus;

  @Field(() => [Bike])
  bikes!: Bike[];
}
