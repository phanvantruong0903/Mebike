import { Field, InputType } from '@nestjs/graphql';
import { EmergencyStatus } from '../../../../prisma';

@InputType()
export class UpdateSosInput {
  @Field(() => String, { nullable: true })
  id?: string;

  @Field(() => [String], { nullable: true })
  resolvedPhotos?: string[];

  @Field(() => EmergencyStatus, { nullable: true })
  status?: EmergencyStatus;
}
