import { PaginationInput } from '../../../../graphql/abstract-input';
import { Field, InputType } from '@nestjs/graphql';
import { WalletStatus } from '../../../../prisma';

@InputType()
export class GetWalletInput extends PaginationInput {
  @Field(() => WalletStatus, { nullable: true })
  status?: WalletStatus;
}
