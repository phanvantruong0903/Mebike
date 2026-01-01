import { Field, ID, ObjectType } from '@nestjs/graphql';
import {
  PaymentMethod,
  TransactionStatus,
  TransactionType,
} from '../../../../prisma/index';

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

  @Field()
  createdAt!: string;

  @Field()
  updatedAt!: string;
}
