import { ObjectType } from '@nestjs/graphql';
import { ApiResponseType } from '../../../../graphql/api-response.type';
import { Wallet } from './Wallet';

@ObjectType()
export class WalletResponse extends ApiResponseType(Wallet) {}

@ObjectType()
export class WalletListResponse extends ApiResponseType(Wallet, {
  isArray: true,
}) {}
