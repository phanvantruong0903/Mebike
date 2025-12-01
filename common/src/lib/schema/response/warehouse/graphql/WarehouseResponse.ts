import { ObjectType } from '@nestjs/graphql';
import { ApiResponseType } from '../../../../graphql/api-response.type';
import { Warehouse } from './Warehouse';

@ObjectType()
export class WarehouseResponse extends ApiResponseType(Warehouse) {}

@ObjectType()
export class WarehouseListResponse extends ApiResponseType(Warehouse, {
  isArray: true,
}) {}
