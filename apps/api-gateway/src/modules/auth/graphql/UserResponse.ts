import { ObjectType } from '@nestjs/graphql';
import { ApiResponseType } from '@mebike/common';
import { User } from './User';

@ObjectType()
export class UserResponse extends ApiResponseType(User) {}

@ObjectType()
export class UserListResponse extends ApiResponseType(User, {
  isArray: true,
}) {}
