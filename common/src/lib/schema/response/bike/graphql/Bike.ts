import { Field, ID, ObjectType, GraphQLISODateTime } from '@nestjs/graphql';
import { Station } from '../../station';
import { Supplier } from '../../supplier';
import { BikeStatus } from '../../../../prisma/index';
import { Transform } from 'class-transformer';

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

  @Field(() => GraphQLISODateTime)
  @Transform(({ value }) => (value ? new Date(value) : null))
  createdAt!: Date;

  @Field(() => GraphQLISODateTime)
  @Transform(({ value }) => (value ? new Date(value) : null))
  updatedAt!: Date;
}
