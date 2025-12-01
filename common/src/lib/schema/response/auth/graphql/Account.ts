import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Account {
  @Field(() => ID)
  id!: string;

  @Field()
  email!: string;

  @Field()
  password!: string;
}
