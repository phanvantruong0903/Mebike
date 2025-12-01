import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Bin {
  @Field(() => ID)
  id!: string;

  @Field()
  rackId!: string;

  @Field()
  code!: string;

  @Field()
  xCoord!: number;

  @Field()
  yCoord!: number;

  @Field()
  maxWeight!: number;

  @Field()
  maxVolume!: number;
}
