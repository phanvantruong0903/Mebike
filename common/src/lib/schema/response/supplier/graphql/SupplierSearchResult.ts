import { Field, ObjectType } from '@nestjs/graphql';
import { Supplier } from './Supplier';

@ObjectType()
export class SupplierSearchResult {
  @Field(() => [Supplier])
  data!: Supplier[];
}
