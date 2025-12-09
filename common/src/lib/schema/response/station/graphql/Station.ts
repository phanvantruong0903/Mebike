import { Field, Float, ID, Int, ObjectType } from '@nestjs/graphql';

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

  @Field(() => Float, { nullable: true })
  distance?: number;
}
