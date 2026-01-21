import { PaginationInput } from '../../../../graphql/abstract-input';
import { Field, InputType } from '@nestjs/graphql';
import { EmergencyStatus } from '../../../../prisma';

@InputType()
export class GetSosInput extends PaginationInput {
  @Field(() => EmergencyStatus, { nullable: true })
  status?: EmergencyStatus;
}
