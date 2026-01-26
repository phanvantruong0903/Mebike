import { Field, ID, ObjectType } from '@nestjs/graphql';
import { WithdrawStatus } from '../../../../prisma/index';
import { IsoDateScalar } from '../../../../graphql/iso-date.scalar';

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

  @Field(() => IsoDateScalar)
  createdAt!: string;

  @Field(() => IsoDateScalar)
  updatedAt!: string;
}
