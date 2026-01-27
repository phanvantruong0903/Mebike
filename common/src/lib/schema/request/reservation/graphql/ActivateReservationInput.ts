import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class ActivateReservationInput {
  @Field(() => String, { nullable: true })
  id?: string;
}
