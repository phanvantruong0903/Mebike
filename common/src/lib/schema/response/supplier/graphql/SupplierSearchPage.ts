import { Field, ObjectType } from '@nestjs/graphql';
import { Supplier } from './Supplier';
import { PaginationMeta } from '../../../../graphql';

@ObjectType()
export class SupplierSearchPage {
  @Field(() => [Supplier])
  data!: Supplier[];

  @Field(() => PaginationMeta)
  pagination!: PaginationMeta;
}
