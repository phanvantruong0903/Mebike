import { ObjectType } from '@nestjs/graphql';
import { AuthPayload } from './AuthPayload';
import { RefreshToken } from './RefreshToken';
import { ApiResponseType } from '../../../../graphql/api-response.type';
import { Account } from './Account';

@ObjectType()
export class RegisterResponse extends ApiResponseType(Account) {}

@ObjectType()
export class LoginResponse extends ApiResponseType(AuthPayload) {}

@ObjectType()
export class ResfreshTokenResponse extends ApiResponseType(RefreshToken) {}
