import { Field, InputType } from '@nestjs/graphql';
import { EmergencyStatus } from '../../../../prisma';

@InputType()
export class UpdateSosInput {
  @Field(() => String)
  id!: string;

  @Field(() => [String])
  resolvedPhotos!: string[];

  @Field(() => EmergencyStatus)
  status!: EmergencyStatus;
}
