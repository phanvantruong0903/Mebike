import { ObjectType } from '@nestjs/graphql';
import { ApiResponseType } from '../../../../graphql/api-response.type';
import { Package } from './Package';

@ObjectType()
export class PackageResponse extends ApiResponseType(Package) {}

@ObjectType()
export class PackageListResponse extends ApiResponseType(Package, {
  isArray: true,
}) {}
