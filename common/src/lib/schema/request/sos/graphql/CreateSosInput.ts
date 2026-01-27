import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CreateSosInput {
  @Field(() => String, { nullable: true })
  rentalId?: string;

  @Field(() => String, { nullable: true })
  issue?: string;

  @Field(() => [String], { nullable: true })
  photos?: string[];

  @Field(() => Boolean, { nullable: true })
  isContinuingRental?: boolean;

  @Field(() => String, { nullable: true })
  latitude?: string;

  @Field(() => String, { nullable: true })
  longitude?: string;
}
