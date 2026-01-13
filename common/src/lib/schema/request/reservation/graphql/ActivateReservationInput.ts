import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class ConfirmReservationInput {
  @Field(() => String)
  id!: string;
}
