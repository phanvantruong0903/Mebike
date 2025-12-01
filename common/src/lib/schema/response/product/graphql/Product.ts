import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Product {
  @Field(() => ID)
  id!: string;

  @Field()
  sku!: string;

  @Field()
  name!: string;

  @Field()
  width!: number;

  @Field()
  height!: number;

  @Field()
  length!: number;

  @Field()
  weight!: number;

  @Field()
  isFragile!: boolean;

  @Field()
  hasBattery!: boolean;

  @Field()
  isHighValue!: boolean;
}
