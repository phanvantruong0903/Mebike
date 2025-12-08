import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class SupplierStats {
  @Field(() => Int)
  totalSupplier!: number;

  @Field(() => Int)
  totalSupplierActive!: number;

  @Field(() => Int)
  totalSupplierInactive!: number;
}
