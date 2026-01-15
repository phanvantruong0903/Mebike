import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class ActivateReservationInput {
  @Field(() => String)
  id!: string;
}
