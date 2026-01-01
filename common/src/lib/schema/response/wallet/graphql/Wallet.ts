import { Field, ID, ObjectType } from '@nestjs/graphql';
import { WalletStatus } from '../../../../prisma/index';

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

  @Field()
  createdAt!: string;

  @Field()
  updatedAt!: string;
}
