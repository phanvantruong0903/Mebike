import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CreateBinInput {
  @Field()
  rackId!: string;

  @Field()
  code!: string;

  @Field()
  xCoord!: number;

  @Field()
  yCoord!: number;

  @Field()
  maxWeight!: number;

  @Field()
  maxVolume!: number;
}
