import { ObjectType } from '@nestjs/graphql';
import { ApiResponseType } from '../../../../graphql/api-response.type';
import { Rental } from './Rental';

@ObjectType()
export class RentalResponse extends ApiResponseType(Rental) {}

@ObjectType()
export class RentalListResponse extends ApiResponseType(Rental, {
  isArray: true,
}) {}
