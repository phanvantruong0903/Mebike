import { Field, Int, ObjectType } from '@nestjs/graphql';
import { ApiResponseType } from '../../../../graphql/api-response.type';
import { Station } from './Station';

@ObjectType()
export class StationResponse extends ApiResponseType(Station) {}

@ObjectType()
export class StationListResponse extends ApiResponseType(Station, {
  isArray: true,
}) {
  @Field(() => Int, { nullable: true })
  activeStation?: number;

  @Field(() => Int, { nullable: true })
  inactiveStation?: number;
}
