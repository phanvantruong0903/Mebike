import { ObjectType } from '@nestjs/graphql';
import { ApiResponseType } from '../../../../graphql/api-response.type';
import { Sos } from './Sos';

@ObjectType()
export class SosResponse extends ApiResponseType(Sos) {}

@ObjectType()
export class SosListResponse extends ApiResponseType(Sos, {
  isArray: true,
}) {}
