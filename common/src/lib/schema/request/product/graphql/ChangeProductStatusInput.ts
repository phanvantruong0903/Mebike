import { Field, InputType } from '@nestjs/graphql';
import { ProductStatus } from '../../../../prisma/index';

@InputType()
export class ChangeProductStatusInput {
  @Field()
  id!: string;

  @Field(() => ProductStatus)
  status!: ProductStatus;
}
