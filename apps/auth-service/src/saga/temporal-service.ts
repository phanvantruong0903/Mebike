import {
  Injectable,
  OnApplicationBootstrap,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { Client, Connection } from '@temporalio/client';
import { Worker } from '@temporalio/worker';
import { UserCreationWorkflow, userCreationWorkflow } from './workflow';
import { UserCreationActivity } from './activities';
import { ModuleRef } from '@nestjs/core';
import { join } from 'node:path';

@Injectable()
export class TemporalService
  implements OnModuleInit, OnModuleDestroy, OnApplicationBootstrap
{
  private client!: Client;
  private worker?: Worker;

  constructor(private readonly moduleRef: ModuleRef) {}

  async onModuleInit() {
    const connection = await Connection.connect({
      address: process.env.TEMPORAL_ADDRESS || 'localhost:7233',
    });
    this.client = new Client({
      connection,
    });
  }

  async onApplicationBootstrap() {
    this.runWorker().catch((err) => {
      console.error('Failed to start Temporal worker:', err);
    });
  }

  async runWorker() {
    try {
      const activitiesInstance = this.moduleRef.get(UserCreationActivity, {
        strict: false,
      });

      const isProduction = process.env.NODE_ENV === 'production';
      const workflowsPath = isProduction
        ? join(__dirname, 'workflow.js')
        : join(process.cwd(), 'apps/auth-service/src/saga/workflow.ts');

      this.worker = await Worker.create({
        workflowsPath,
        bundlerOptions: {
          webpackConfigHook: (config) => {
            config.resolve ??= {};
            config.resolve.alias ??= {};
            Object.assign(config.resolve.alias, {
              '@mebike/common': join(
                process.cwd(),
                'common/src/lib/prisma/user/generated/enums.ts',
              ),
            });
            return config;
          },
        },
        activities: {
          createUserProfile:
            activitiesInstance.createUserProfile.bind(activitiesInstance),
          createWallet:
            activitiesInstance.createWallet.bind(activitiesInstance),
          sendWelcomeEmail:
            activitiesInstance.sendWelcomeEmail.bind(activitiesInstance),
          deleteUserProfile:
            activitiesInstance.deleteUserProfile.bind(activitiesInstance),
          deleteAccount:
            activitiesInstance.deleteAccount.bind(activitiesInstance),
        },
        taskQueue: 'user-creation',
      });
      await this.worker.run();
    } catch (error) {
      console.error('Temporal worker error:', error);
    }
  }

  async onModuleDestroy() {
    if (this.worker) {
      this.worker.shutdown();
    }
  }

  async startUserCreationWorkflow(data: UserCreationWorkflow) {
    const handle = await this.client.workflow.start(userCreationWorkflow, {
      taskQueue: 'user-creation',
      workflowId: `user-creation-${data.accountId}`,
      args: [data],
    });

    return handle.workflowId;
  }

  async getUserCreationWorkflowResult(workflowId: string): Promise<any> {
    const handle = this.client.workflow.getHandle(workflowId);
    const result = await handle.result();
    return result;
  }
}
