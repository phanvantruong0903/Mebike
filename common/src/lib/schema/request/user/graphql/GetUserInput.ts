import { PaginationInput } from '../../../../graphql/abstract-input';
import { Field, InputType } from '@nestjs/graphql';
import { UserStatus } from '../../../../prisma';

@InputType()
export class GetUsersInput extends PaginationInput {
  @Field(() => UserStatus, { nullable: true })
  status?: UserStatus;
}
