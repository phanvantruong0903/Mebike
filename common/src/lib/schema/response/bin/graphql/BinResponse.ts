import { ObjectType } from '@nestjs/graphql';
import { ApiResponseType } from '../../../../graphql/api-response.type';
import { Bin } from './Bin';

@ObjectType()
export class BinResponse extends ApiResponseType(Bin) {}

@ObjectType()
export class BinListResponse extends ApiResponseType(Bin, {
  isArray: true,
}) {}
