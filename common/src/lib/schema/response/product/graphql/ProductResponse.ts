import { ObjectType } from '@nestjs/graphql';
import { ApiResponseType } from '../../../../graphql/api-response.type';
import { Product } from './Product';

@ObjectType()
export class ProductResponse extends ApiResponseType(Product) {}

@ObjectType()
export class ProductListResponse extends ApiResponseType(Product, {
  isArray: true,
}) {}
