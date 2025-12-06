import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class ResetPasswordRequestInput {
  @Field()
  email!: string;
}
