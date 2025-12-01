import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class UpdateStockInput {
  @Field()
  binId!: string;

  @Field()
  productId!: string;

  @Field()
  quantityChange!: number;

  @Field()
  reason!: string;
}
