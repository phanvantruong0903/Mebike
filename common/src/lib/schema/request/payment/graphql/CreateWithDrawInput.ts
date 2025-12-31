import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CreateWithDrawInput {
  @Field()
  bank!: string;

  @Field()
  accountOwner!: string;

  @Field()
  accountNumber!: string;

  @Field(() => Number)
  amount!: number;

  @Field(() => String, { nullable: true })
  note?: string;
}
