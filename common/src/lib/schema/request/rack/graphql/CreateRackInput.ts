import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CreateRackInput {
  @Field()
  zoneId!: string;

  @Field()
  code!: string;
}
