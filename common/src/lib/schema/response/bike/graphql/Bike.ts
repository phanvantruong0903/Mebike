import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Station } from '../../station';
import { Supplier } from '../../supplier';
import { BikeStatus } from '../../../../prisma/index';
import { IsoDateScalar } from '../../../../graphql/iso-date.scalar';

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

  @Field(() => IsoDateScalar)
  createdAt!: string;

  @Field(() => IsoDateScalar)
  updatedAt!: string;
}
