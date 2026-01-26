import { Field, ID, ObjectType, GraphQLISODateTime } from '@nestjs/graphql';
import { BikeStatus } from '../../../../prisma';
import { Station } from '../../station';
import { Supplier } from '../../supplier';

@ObjectType()
export class BikeResult {
  @Field(() => ID)
  id!: string;

  @Field()
  chipId!: string;

  @Field()
  stationId!: string;

  @Field()
  supplierId!: string;

  @Field(() => BikeStatus)
  status!: BikeStatus;

  @Field(() => GraphQLISODateTime)
  createdAt!: Date;

  @Field(() => GraphQLISODateTime)
  updatedAt!: Date;

  @Field(() => Station, { nullable: true })
  station?: Station;

  @Field(() => Supplier, { nullable: true })
  supplier?: Supplier;
}

@ObjectType()
export class BikeSearchResult {
  @Field(() => [BikeResult])
  data!: BikeResult[];
}
