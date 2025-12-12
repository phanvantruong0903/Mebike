import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class EndRentalInput {
  @Field(() => String)
  accountId!: string;

  @Field(() => String)
  id!: string;
}
