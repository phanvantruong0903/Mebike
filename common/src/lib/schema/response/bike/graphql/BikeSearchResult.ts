import { Field, ID, ObjectType } from '@nestjs/graphql';
import { BikeStatus } from '../../../../prisma';
import { Station } from '../../station';
import { Supplier } from '../../supplier';
import { IsoDateScalar } from '../../../../graphql/iso-date.scalar';

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

  @Field(() => IsoDateScalar)
  createdAt!: string;

  @Field(() => IsoDateScalar)
  updatedAt!: string;

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
