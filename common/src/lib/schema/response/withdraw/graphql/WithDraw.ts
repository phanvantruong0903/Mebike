import { Field, ID, ObjectType, GraphQLISODateTime } from '@nestjs/graphql';
import { WithdrawStatus } from '../../../../prisma/index';
import { Transform } from 'class-transformer';

@ObjectType()
export class Withdraw {
  @Field(() => ID)
  id!: string;

  @Field()
  accountId!: string;

  @Field(() => Number)
  amount!: number;

  @Field(() => String)
  bank!: string;

  @Field(() => String)
  accountOwner!: string;

  @Field(() => String)
  accountNumber!: string;

  @Field(() => String)
  reason!: string;

  @Field(() => String)
  note!: string;

  @Field(() => WithdrawStatus)
  status!: WithdrawStatus;

  @Field(() => GraphQLISODateTime)
  @Transform(({ value }) => new Date(value))
  createdAt!: Date;

  @Field(() => GraphQLISODateTime)
  @Transform(({ value }) => new Date(value))
  updatedAt!: Date;
}
