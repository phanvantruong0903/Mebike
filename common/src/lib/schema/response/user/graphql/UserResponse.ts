import { ObjectType } from '@nestjs/graphql';
import { UserProfile } from './User';
import { ApiResponseType } from '../../../../graphql/api-response.type';
import { Account } from '../../auth/graphql/Account';

@ObjectType()
export class UserResponse extends ApiResponseType(UserProfile) {}

@ObjectType()
export class UserListResponse extends ApiResponseType(UserProfile, {
  isArray: true,
}) {}

@ObjectType()
export class ChangePasswordResponse extends ApiResponseType(Account) {}
