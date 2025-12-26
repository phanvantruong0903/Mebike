import { proxyActivities } from '@temporalio/workflow';
import { Role } from '@mebike/common';

const {
  createUserProfile,
  createWallet,
  sendWelcomeEmail,
  deleteUserProfile,
  deleteAccount,
} = proxyActivities({
  startToCloseTimeout: '1 minute',
  retry: {
    maximumAttempts: 3,
  },
});

export interface UserCreationWorkflow {
  accountId: string;
  name: string;
  email: string;
  phone: string;
  role: Role;
  YOB: number;
}

export async function userCreationWorkflow(
  data: UserCreationWorkflow,
): Promise<{ success: boolean; error?: string }> {
  try {
    await Promise.all([
      createUserProfile({
        accountId: data.accountId,
        name: data.name,
        role: data.role || Role.USER,
        phone: data.phone,
        YOB: data.YOB,
      }),
      createWallet({
        accountId: data.accountId,
      }),
      sendWelcomeEmail({
        key: data.accountId,
        email: data.email,
        name: data.name,
      }),
    ]);

    return { success: true };
  } catch (error) {
    // Compensation: Always attempt to delete profile and account
    // These operations are safe even if resources don't exist yet
    await deleteUserProfile({
      accountId: data.accountId,
    });
    await deleteAccount({
      accountId: data.accountId,
    });

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
