import { ObjectType } from '@nestjs/graphql';
import { ApiResponseType } from '../../../../graphql/api-response.type';
import { Rack } from './Rack';

@ObjectType()
export class RackResponse extends ApiResponseType(Rack) {}

@ObjectType()
export class RackListResponse extends ApiResponseType(Rack, {
  isArray: true,
}) {}
