import { ObjectType } from '@nestjs/graphql';
import { ApiResponseType } from '../../../../graphql/api-response.type';
import { Supplier } from './Supplier';
import { SupplierStats } from './SupplierStats';

@ObjectType()
export class SupplierResponse extends ApiResponseType(Supplier) {}

@ObjectType()
export class SupplierListResponse extends ApiResponseType(Supplier, {
  isArray: true,
}) {}

@ObjectType()
export class SupplierStatsResponse extends ApiResponseType(SupplierStats) {}
