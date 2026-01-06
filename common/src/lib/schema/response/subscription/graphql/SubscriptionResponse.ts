import { ObjectType } from '@nestjs/graphql';
import { ApiResponseType } from '../../../../graphql/api-response.type';
import { Subscription } from './Subscription';

@ObjectType()
export class SubscriptionResponse extends ApiResponseType(Subscription) {}

@ObjectType()
export class SubscriptionListResponse extends ApiResponseType(Subscription, {
  isArray: true,
}) {}
