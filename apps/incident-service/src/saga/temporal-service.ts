import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { Client, Connection } from '@temporalio/client';
import { Worker } from '@temporalio/worker';
import { SosCreationWorkflow, sosCreationWorkflow } from './workflow';
import { SosCreationActivity } from './activities';
import { ModuleRef } from '@nestjs/core';
import { join } from 'node:path';

@Injectable()
export class TemporalService implements OnModuleDestroy {
  private client!: Client;
  private worker?: Worker;

  constructor(private readonly moduleRef: ModuleRef) {
    this.initialize();
  }

  private async initialize() {
    try {
      const connection = await Connection.connect({
        address: process.env.TEMPORAL_ADDRESS || 'localhost:7233',
      });

      this.client = new Client({
        connection,
      });

      this.startWorker();
    } catch (error) {
      console.error('Failed to connect to Temporal:', error);
    }
  }

  private startWorker() {
    this.runWorker().catch((err) => {
      console.error('Failed to start Temporal worker:', err);
    });
  }

  async runWorker() {
    try {
      const activitiesInstance = this.moduleRef.get(SosCreationActivity, {
        strict: false,
      });

      const isProduction = process.env.NODE_ENV === 'production';
      const workflowsPath = isProduction
        ? join(process.cwd(), 'src/saga/workflow.ts')
        : join(process.cwd(), 'apps/incident-service/src/saga/workflow.ts');

      const { NativeConnection } = await import('@temporalio/worker');
      const workerConnection = await NativeConnection.connect({
        address: process.env.TEMPORAL_ADDRESS || 'localhost:7233',
      });

      this.worker = await Worker.create({
        connection: workerConnection,
        workflowsPath,
        activities: {
          changeBikeStatus:
            activitiesInstance.changeBikeStatus.bind(activitiesInstance),
          createSos: activitiesInstance.createSos.bind(activitiesInstance),
          deleteSos: activitiesInstance.deleteSos.bind(activitiesInstance),
        },
        taskQueue: 'sos-creation',
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

  async startSosCreationWorkflow(data: SosCreationWorkflow) {
    const handle = await this.client.workflow.start(sosCreationWorkflow, {
      taskQueue: 'sos-creation',
      workflowId: `sos-creation-${data.rentalId}`,
      args: [data],
    });

    return handle.workflowId;
  }

  async getSosCreationWorkflowResult(workflowId: string): Promise<any> {
    const handle = this.client.workflow.getHandle(workflowId);
    const result = await handle.result();
    return result;
  }
}
