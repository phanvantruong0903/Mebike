import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CreateRentalInput {
  @Field(() => String)
  accountId!: string;

  @Field(() => String)
  bikeId!: string;

  @Field(() => String, { nullable: true })
  subscriptionId?: string;
}
