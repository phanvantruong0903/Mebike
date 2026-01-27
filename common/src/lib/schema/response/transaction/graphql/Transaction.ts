import { Field, ID, ObjectType, GraphQLISODateTime } from '@nestjs/graphql';
import {
  PaymentMethod,
  TransactionStatus,
  TransactionType,
} from '../../../../prisma/index';
import { Transform } from 'class-transformer';

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

  @Field(() => GraphQLISODateTime)
  @Transform(({ value }) => new Date(value))
  createdAt!: Date;

  @Field(() => GraphQLISODateTime)
  @Transform(({ value }) => new Date(value))
  updatedAt!: Date;
}
