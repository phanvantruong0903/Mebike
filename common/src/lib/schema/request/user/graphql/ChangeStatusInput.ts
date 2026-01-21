import { Field, InputType } from '@nestjs/graphql';
import { UserStatus } from '../../../../prisma/index';

@InputType()
export class ChangeUserStatusInput {
  @Field({ nullable: true })
  accountId?: string;

  @Field(() => UserStatus, { nullable: true })
  status?: UserStatus;
}
