import DataLoader from 'dataloader';
import { Injectable, Scope } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { UserProfile } from '@mebike/common';

@Injectable({ scope: Scope.REQUEST })
export class UserProfileDataloader {
  constructor(private readonly userService: UserService) {}

  public readonly batchUserProfiles = new DataLoader<string, UserProfile>(
    async (ids: readonly string[]) => {
      const accounts = await this.userService.getUsersByAccountIds(
        ids as string[],
      );

      const accountsMap = new Map(accounts.map((p) => [p.id, p]));

      return ids.map(
        (id) =>
          accountsMap.get(id) ||
          new Error(`User Profile not found for id ${id}`),
      );
    },
  );
}
