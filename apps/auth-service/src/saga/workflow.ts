import { proxyActivities } from '@temporalio/workflow';

const {
  createUserProfile,
  createWallet,
  sendWelcomeEmail,
  deleteUserProfile,
  deleteAccount,
} = proxyActivities({
  startToCloseTimeout: '1 minute',
  retry: {
    maximumAttempts: 1,
  },
});

export interface UserCreationWorkflow {
  accountId: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  YOB: number;
  workStationId?: string;
}

export async function userCreationWorkflow(
  data: UserCreationWorkflow,
): Promise<{ success: boolean; error?: string }> {
  try {
    let createdWallet = false;
    await Promise.all([
      createUserProfile({
        accountId: data.accountId,
        name: data.name,
        role: data.role || 'USER',
        phone: data.phone,
        YOB: data.YOB,
        workStationId: data.workStationId,
      }),
      createWallet({
        accountId: data.accountId,
      }),
    ]);
    createdWallet = true;
    if (createdWallet) {
      await sendWelcomeEmail({
        key: data.accountId,
        email: data.email,
        name: data.name,
      });
    }

    return { success: true };
  } catch (error) {
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
