import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CreateSosInput {
  @Field(() => String)
  rentalId!: string;

  @Field(() => String, { nullable: true })
  requesterId?: string;

  @Field(() => String)
  issue!: string;

  @Field(() => [String])
  photos!: string[];

  @Field(() => Boolean)
  isContinuingRental!: boolean;

  @Field(() => String)
  latitude!: string;

  @Field(() => String)
  longitude!: string;
}
