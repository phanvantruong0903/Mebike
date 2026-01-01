import { Field, InputType } from '@nestjs/graphql';
import { WithdrawStatus } from '../../../../prisma/index';

@InputType()
export class UpdateWithDrawStatusInput {
  @Field()
  id!: string;

  @Field(() => WithdrawStatus)
  status!: WithdrawStatus;

  @Field(() => String, { nullable: true })
  reason?: string;
}
