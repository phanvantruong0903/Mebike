import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CreateBikeInput {
  @Field()
  chipId!: string;

  @Field(() => String)
  stationId!: string;

  @Field(() => String)
  supplierId!: string;
}
