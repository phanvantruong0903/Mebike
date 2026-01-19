import { Field, InputType } from '@nestjs/graphql';
import { WithdrawStatus } from '../../../../prisma/index';

@InputType()
export class UpdateWithDrawStatusInput {
  @Field({ nullable: true })
  id?: string;

  @Field(() => WithdrawStatus, { nullable: true })
  status?: WithdrawStatus;

  @Field(() => String, { nullable: true })
  reason?: string;
}
