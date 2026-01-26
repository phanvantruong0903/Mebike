import { Field, ID, ObjectType } from '@nestjs/graphql';
import { WalletStatus } from '../../../../prisma/index';
import { IsoDateScalar } from '../../../../graphql/index';

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

  @Field(() => IsoDateScalar)
  createdAt!: string;

  @Field(() => IsoDateScalar)
  updatedAt!: string;
}
