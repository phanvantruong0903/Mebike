import { PaginationInput } from '../../../../graphql/abstract-input';
import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class GetTransactionInput extends PaginationInput {
  @Field(() => String, { nullable: true })
  accountId?: string;
}
