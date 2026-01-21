import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CreateReservationInput {
  @Field(() => String, { nullable: true })
  bikeId?: string;

  @Field(() => String, { nullable: true })
  startTime?: string;

  @Field(() => String, { nullable: true })
  subscriptionId?: string;
}
