import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Role, UserStatus, UserVerifyStatus } from '../../../../prisma/index';
import { Account } from '../../auth';

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

  @Field(() => String)
  phone!: string;

  @Field(() => Account, { nullable: true })
  userAccount?: Account;

  @Field(() => String, { nullable: true })
  address?: string;

  @Field(() => String, { nullable: true })
  avatarUrl?: string;

  @Field(() => String, { nullable: true })
  nfcCardUid?: string;

  @Field()
  createdAt!: string;

  @Field()
  updatedAt!: string;
}
