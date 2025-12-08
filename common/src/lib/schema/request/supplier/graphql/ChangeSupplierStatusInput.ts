import { Field, InputType } from '@nestjs/graphql';
import { SupplierStatus } from '../../../../prisma/index';

@InputType()
export class ChangeSupplierStatusInput {
  @Field()
  id!: string;

  @Field(() => SupplierStatus)
  status!: SupplierStatus;
}
