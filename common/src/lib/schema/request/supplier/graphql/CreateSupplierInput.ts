import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CreateSupplierInput {
  @Field({ nullable: true })
  name?: string;

  @Field(() => String, { nullable: true })
  phone?: string;

  @Field(() => String, { nullable: true })
  address?: string;

  @Field(() => Number, { nullable: true })
  contactFee?: number;
}
