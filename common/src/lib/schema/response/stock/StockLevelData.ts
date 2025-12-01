import { Field, Int, ObjectType } from '@nestjs/graphql';
import { BinItemDetail } from './BinItemDetail';

@ObjectType()
export class StockLevelData {
  @Field()
  productId!: string;

  @Field(() => Int)
  totalQuantity!: number;

  @Field(() => [BinItemDetail])
  details!: BinItemDetail[];
}
