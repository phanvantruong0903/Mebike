import { PaginationInput } from '../../../../graphql/abstract-input';
import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class GetStockInput extends PaginationInput {
  @Field()
  productId!: string;

  @Field(() => String, { nullable: true })
  warehouseId?: string;
}
