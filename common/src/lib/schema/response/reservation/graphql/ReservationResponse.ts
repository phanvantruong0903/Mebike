import { ObjectType } from '@nestjs/graphql';
import { ApiResponseType } from '../../../../graphql/api-response.type';
import { Reservation } from './Reservation';

@ObjectType()
export class ReservationResponse extends ApiResponseType(Reservation) {}

@ObjectType()
export class ReservationListResponse extends ApiResponseType(Reservation, {
  isArray: true,
}) {}
