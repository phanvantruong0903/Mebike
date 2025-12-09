import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CreateStationInput {
  @Field()
  name!: string;

  @Field(() => String)
  address!: string;

  @Field(() => Number)
  latitude!: number;

  @Field(() => Number)
  longitude!: number;

  @Field(() => Number)
  capacity!: number;
}
