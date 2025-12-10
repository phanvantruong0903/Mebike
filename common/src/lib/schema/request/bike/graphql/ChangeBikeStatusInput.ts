import { Field, InputType } from '@nestjs/graphql';
import { BikeStatus } from '../../../../prisma/index';

@InputType()
export class ChangeBikeStatusInput {
  @Field()
  id!: string;

  @Field(() => BikeStatus)
  status!: BikeStatus;
}
