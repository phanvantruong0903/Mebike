import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CreatePaymentInput {
  @Field(() => Number, { nullable: true })
  amount?: number;

  @Field(() => String, { nullable: true })
  ipAddr?: string;

  @Field(() => String, { nullable: true })
  accountId?: string;
}
