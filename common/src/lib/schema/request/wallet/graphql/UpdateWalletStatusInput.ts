import { InputType, Field } from '@nestjs/graphql';
import { WalletStatus } from '../../../../prisma/index';

@InputType()
export class UpdateWalletStatusInput {
  @Field(() => String, { nullable: true })
  id?: string;

  @Field(() => WalletStatus, { nullable: true })
  status?: WalletStatus;
}
