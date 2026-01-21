import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class LogoutInput {
  @Field({ nullable: true })
  accessToken?: string;

  @Field({ nullable: true })
  refreshToken?: string;
}
