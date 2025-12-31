import { ObjectType } from '@nestjs/graphql';
import { ApiResponseType } from '../../../../graphql/api-response.type';
import { Withdraw } from './WithDraw';

@ObjectType()
export class WithdrawResponse extends ApiResponseType(Withdraw) {}

@ObjectType()
export class WithdrawListResponse extends ApiResponseType(Withdraw, {
  isArray: true,
}) {}
