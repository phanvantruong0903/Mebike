import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CreatePaymentInput {
  @Field(() => Number, { nullable: true })
  amount?: number;
}
