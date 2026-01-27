import { SupplierStatus } from '../../../../prisma/index';
import { PaginationInput } from '../../../../graphql/abstract-input';
import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class GetSupplierInput extends PaginationInput {
  @Field(() => SupplierStatus, { nullable: true })
  status?: SupplierStatus;
}
