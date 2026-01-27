import { Field, ID, ObjectType, GraphQLISODateTime } from '@nestjs/graphql';
import { Role, UserStatus, UserVerifyStatus } from '../../../../prisma/index';
import { Account } from '../../auth';
import { Transform } from 'class-transformer';

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

  @Field(() => String, { nullable: true })
  workStationId?: string;

  @Field(() => GraphQLISODateTime)
  @Transform(({ value }) => new Date(value))
  createdAt!: Date;

  @Field(() => GraphQLISODateTime)
  @Transform(({ value }) => new Date(value))
  updatedAt!: Date;
}
