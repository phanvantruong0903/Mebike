import { Field, InputType } from '@nestjs/graphql';
import { SupplierStatus } from '../../../../prisma/index';

@InputType()
export class ChangeSupplierStatusInput {
  @Field({ nullable: true })
  id?: string;

  @Field(() => SupplierStatus, { nullable: true })
  status?: SupplierStatus;
}
