import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class ResetPasswordInput {
  @Field()
  newPassword!: string;

  @Field()
  resetToken!: string;
}
