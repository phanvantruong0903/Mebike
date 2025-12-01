import { Field, ObjectType, Int } from '@nestjs/graphql';

@ObjectType()
export class BinItemDetail {
  @Field()
  binId!: string;

  @Field()
  binCode!: string;

  @Field(() => Int)
  quantity!: number;
}
