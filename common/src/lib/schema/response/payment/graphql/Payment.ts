import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Payment {
  @Field(() => ID)
  paymentUrl!: string;
}
