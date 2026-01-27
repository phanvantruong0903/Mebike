import { PaginationInput } from '../../../../graphql/abstract-input';
import { Field, InputType } from '@nestjs/graphql';
import { BikeStatus } from '../../../../prisma';

@InputType()
export class GetBikeInput extends PaginationInput {
  @Field(() => BikeStatus, { nullable: true })
  status?: BikeStatus;

  @Field(() => String, { nullable: true })
  stationId?: string;

  @Field(() => String, { nullable: true })
  supplierId?: string;
}
