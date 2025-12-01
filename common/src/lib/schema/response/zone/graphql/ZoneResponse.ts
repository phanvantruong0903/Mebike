import { ObjectType } from '@nestjs/graphql';
import { ApiResponseType } from '../../../../graphql/api-response.type';
import { Zone } from './Zone';

@ObjectType()
export class ZoneResponse extends ApiResponseType(Zone) {}

@ObjectType()
export class ZoneListResponse extends ApiResponseType(Zone, {
  isArray: true,
}) {}
