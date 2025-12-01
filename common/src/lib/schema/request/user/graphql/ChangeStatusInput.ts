import { Field, InputType } from '@nestjs/graphql';
import { UserStatus } from '../../../../prisma/index';

@InputType()
export class ChangeUserStatusInput {
  @Field()
  accountId!: string;

  @Field(() => UserStatus)
  status!: UserStatus;
}
