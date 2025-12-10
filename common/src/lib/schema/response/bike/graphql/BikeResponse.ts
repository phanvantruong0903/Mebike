import { ObjectType } from '@nestjs/graphql';
import { ApiResponseType } from '../../../../graphql/api-response.type';
import { Bike } from './Bike';

@ObjectType()
export class BikeResponse extends ApiResponseType(Bike) {}

@ObjectType()
export class BikeListResponse extends ApiResponseType(Bike, {
  isArray: true,
}) {}
