import { InputType, Field } from '@nestjs/graphql';
import { WalletStatus } from '../../../../prisma/index';

@InputType()
export class UpdateWalletStatusInput {
  @Field(() => String)
  id!: string;

  @Field(() => WalletStatus)
  status!: WalletStatus;
}
