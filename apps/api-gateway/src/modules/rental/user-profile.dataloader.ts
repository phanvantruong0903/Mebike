import { Injectable, Scope } from '@nestjs/common';
import { UserService } from '../user/user.service';
import DataLoader from 'dataloader';
import { UserProfile } from '@mebike/common';

@Injectable({ scope: Scope.REQUEST })
export class UserProfileDataLoader {
  constructor(private readonly userService: UserService) {}

  public readonly batchUserProfiles = new DataLoader<string, UserProfile>(
    async (ids: readonly string[]) => {
      const userProfiles = await this.userService.getUsersByAccountIds(
        ids as string[],
      );

      const userProfilesMap = new Map(
        userProfiles.map((p) => [p.accountId, p]),
      );

      return ids.map(
        (id) =>
          userProfilesMap.get(id) ||
          new Error(`User profile not found for id ${id}`),
      );
    },
  );
}
