import { PaginationInput } from '../../../../graphql/abstract-input';
import { Field, InputType } from '@nestjs/graphql';
import { StationStatus } from '../../../../prisma';

@InputType()
export class GetStationInput extends PaginationInput {
  @Field(() => String, { nullable: true })
  longitude?: string;

  @Field(() => String, { nullable: true })
  latitude?: string;

  @Field(() => StationStatus, { nullable: true })
  status?: StationStatus;
}
