import { Field, InputType } from '@nestjs/graphql';
import { BikeStatus } from '../../../../prisma/index';

@InputType()
export class ChangeBikeStatusInput {
  @Field({ nullable: true })
  id?: string;

  @Field(() => BikeStatus, { nullable: true })
  status?: BikeStatus;
}
