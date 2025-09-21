import { Args, Query, Resolver } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { UserListResponse, UserResponse } from './graphql/UserResponse';

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Query(() => UserListResponse, { name: 'getAllUser' })
  async getAllUser(): Promise<UserListResponse> {
    return this.authService.getAllUser();
  }

  @Query(() => UserResponse, { name: 'getUser' })
  async getUserDetail(@Args('id') id: string): Promise<UserResponse> {
    return this.authService.userDetail(id);
  }
}
