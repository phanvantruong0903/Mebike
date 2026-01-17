import { Field, ObjectType } from '@nestjs/graphql';
import { Station } from '../../station';
import { Supplier } from '../../supplier';
import { BikeStatus } from '../../../../prisma';

@ObjectType()
export class BikeSearchResult {
  @Field()
  id!: string;

  @Field()
  chipId!: string;

  @Field(() => BikeStatus)
  status!: BikeStatus;

  @Field(() => Supplier, { nullable: true })
  supplier?: Supplier;

  @Field(() => Station, { nullable: true })
  station?: Station;
}
