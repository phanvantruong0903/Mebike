import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CreateWithDrawInput {
  @Field({ nullable: true })
  bank?: string;

  @Field({ nullable: true })
  accountOwner?: string;

  @Field({ nullable: true })
  accountNumber?: string;

  @Field(() => Number, { nullable: true })
  amount?: number;

  @Field(() => String, { nullable: true })
  note?: string;
}
