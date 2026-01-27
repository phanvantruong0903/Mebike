import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class VerifyOtpInput {
  @Field({ nullable: true })
  email?: string;

  @Field({ nullable: true })
  otp?: string;
}
