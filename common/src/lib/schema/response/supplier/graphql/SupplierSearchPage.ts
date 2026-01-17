import { Field, Int, ObjectType } from '@nestjs/graphql';
import { SupplierSearchResult } from './SupplierSearchResult';

@ObjectType()
export class SupplierSearchPage {
  @Field(() => [SupplierSearchResult])
  data!: SupplierSearchResult[];

  @Field(() => Int)
  total!: number;

  @Field(() => Int)
  page!: number;

  @Field(() => Int)
  totalPages!: number;
}
