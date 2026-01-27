import { Field, ID, ObjectType, GraphQLISODateTime } from '@nestjs/graphql';
import { WalletStatus } from '../../../../prisma/index';
import { Transform } from 'class-transformer';

@ObjectType()
export class Wallet {
  @Field(() => ID)
  id!: string;

  @Field()
  accountId!: string;

  @Field(() => Number)
  balance!: number;

  @Field(() => WalletStatus)
  status!: WalletStatus;

  @Field(() => GraphQLISODateTime)
  @Transform(({ value }) => new Date(value))
  createdAt!: Date;

  @Field(() => GraphQLISODateTime)
  @Transform(({ value }) => new Date(value))
  updatedAt!: Date;
}
