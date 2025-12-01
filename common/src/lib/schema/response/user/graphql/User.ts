import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Role, UserStatus, UserVerifyStatus } from '../../../../prisma/index';

@ObjectType()
export class UserProfile {
  @Field(() => ID)
  id!: string;

  @Field()
  accountId!: string;

  @Field()
  name!: string;

  @Field()
  YOB!: number;

  @Field(() => Role)
  role!: Role;

  @Field(() => UserVerifyStatus)
  verify!: UserVerifyStatus;

  @Field(() => UserStatus)
  status!: UserStatus;
}
