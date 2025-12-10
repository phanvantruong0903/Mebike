import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Station } from '../../station';
import { Supplier } from '../../supplier';
import { BikeStatus } from '../../../../prisma/index';

@ObjectType()
export class Bike {
  @Field(() => ID)
  id!: string;

  @Field()
  chipId!: string;

  @Field(() => Station, { nullable: true })
  station?: Station;

  @Field(() => Supplier, { nullable: true })
  supplier?: Supplier;

  @Field(() => BikeStatus)
  status!: BikeStatus;
}
