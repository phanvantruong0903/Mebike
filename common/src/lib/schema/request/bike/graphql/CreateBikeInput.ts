import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CreateBikeInput {
  @Field({ nullable: true })
  chipId?: string;

  @Field(() => String, { nullable: true })
  stationId?: string;

  @Field(() => String, { nullable: true })
  supplierId?: string;
}
