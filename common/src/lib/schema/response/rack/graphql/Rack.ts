import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Rack {
  @Field(() => ID)
  id!: string;

  @Field()
  zoneId!: string;

  @Field()
  code!: string;
}
