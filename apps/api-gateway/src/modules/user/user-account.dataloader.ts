import { Account } from '@mebike/common';
import { AuthService } from '../auth/auth.service';
import DataLoader from 'dataloader';
import { Injectable, Scope } from '@nestjs/common';

@Injectable({ scope: Scope.REQUEST })
export class UserAccountDataloader {
  constructor(private readonly authService: AuthService) {}

  public readonly batchAccounts = new DataLoader<string, Account>(
    async (ids: readonly string[]) => {
      const accounts = await this.authService.getAccountByAccountIds(
        ids as string[],
      );

      const accountsMap = new Map(accounts.map((p) => [p.id, p]));

      return ids.map(
        (id) =>
          accountsMap.get(id) ||
          new Error(`User account not found for id ${id}`),
      );
    },
  );
}
