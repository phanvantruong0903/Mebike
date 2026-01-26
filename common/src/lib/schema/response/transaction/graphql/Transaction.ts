import { Field, ID, ObjectType } from '@nestjs/graphql';
import {
  PaymentMethod,
  TransactionStatus,
  TransactionType,
} from '../../../../prisma/index';
import { IsoDateScalar } from '../../../../graphql/index';

@ObjectType()
export class Transaction {
  @Field(() => ID)
  id!: string;

  @Field()
  accountId!: string;

  @Field(() => TransactionType)
  type!: TransactionType;

  @Field(() => TransactionStatus)
  status!: TransactionStatus;

  @Field(() => Number)
  amount!: number;

  @Field(() => PaymentMethod)
  paymentMethod!: PaymentMethod;

  @Field()
  description!: string;

  @Field(() => IsoDateScalar)
  createdAt!: string;

  @Field(() => IsoDateScalar)
  updatedAt!: string;
}
