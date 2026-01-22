import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class EndRentalInput {
  @Field(() => String)
  id!: string;

  @Field(() => String)
  endStationId!: string;
}
