import { ObjectType } from '@nestjs/graphql';
import { ApiResponseType } from '../../../../graphql/api-response.type';
import { Transaction } from './Transaction';

@ObjectType()
export class TransactionResponse extends ApiResponseType(Transaction) {}

@ObjectType()
export class TransactionListResponse extends ApiResponseType(Transaction, {
  isArray: true,
}) {}
