import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CreateReservationInput {
  @Field(() => String)
  bikeId!: string;

  @Field(() => String)
  stationId!: string;

  @Field(() => String)
  startTime!: string;

  @Field(() => String, { nullable: true })
  subscriptionId?: string;
}
