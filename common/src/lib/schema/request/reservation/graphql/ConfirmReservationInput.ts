import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class ConfirmReservationInput {
  @Field(() => String)
  accountId!: string;

  @Field(() => String)
  id!: string;
}
