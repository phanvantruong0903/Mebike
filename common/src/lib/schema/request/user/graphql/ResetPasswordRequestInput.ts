import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class ResetPasswordRequestInput {
  @Field({ nullable: true })
  email?: string;
}
