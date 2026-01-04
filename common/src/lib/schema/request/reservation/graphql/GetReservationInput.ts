import { Field } from '@nestjs/graphql';

export class GetReservationInput {
  @Field(() => String)
  id!: string;
}
