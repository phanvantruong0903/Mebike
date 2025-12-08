import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class ResetToken {
  @Field()
  resetToken!: string;
}

@ObjectType()
export class VerifyOtpResponse {
  @Field()
  success!: boolean;

  @Field()
  message!: string;

  @Field(() => ResetToken, { nullable: true })
  data?: ResetToken;

  @Field(() => [String], { nullable: true })
  errors?: string[];
}
