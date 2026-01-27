import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class EndRentalInput {
  @Field(() => String, { nullable: true })
  id?: string;
}
