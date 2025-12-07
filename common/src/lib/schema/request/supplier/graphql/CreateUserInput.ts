import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CreateSupplierInput {
  @Field()
  name!: string;

  @Field(() => String)
  phone!: string;

  @Field(() => String)
  address!: string;

  @Field(() => Number)
  contactFee!: number;
}
