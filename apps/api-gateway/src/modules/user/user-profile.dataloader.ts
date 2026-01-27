import { Injectable, Scope } from '@nestjs/common';
import DataLoader from 'dataloader';
import { UserService } from './user.service';
import { UserProfile } from '@mebike/common';

@Injectable({ scope: Scope.REQUEST })
export class UserProfileDataLoader {
  constructor(private readonly userService: UserService) {}

  public readonly batchUserProfiles = new DataLoader<string, UserProfile>(
    async (accountIds: readonly string[]) => {
      const userProfiles = await this.userService.getUsersByAccountIds(
        accountIds as string[],
      );

      const userProfilesMap = new Map(
        userProfiles.map((p) => [p.accountId, p]),
      );

      return accountIds.map(
        (id) =>
          userProfilesMap.get(id) ||
          new Error(`User profile not found for accountId ${id}`),
      );
    },
  );
}
