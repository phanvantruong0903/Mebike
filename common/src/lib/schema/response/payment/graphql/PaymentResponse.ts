import { ObjectType } from '@nestjs/graphql';
import { ApiResponseType } from '../../../../graphql/api-response.type';
import { Payment } from './payment';

@ObjectType()
export class PaymentResponse extends ApiResponseType(Payment) {}
