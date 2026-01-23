import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { Client, Connection } from '@temporalio/client';
import { Worker } from '@temporalio/worker';
import {
  RentalCreationWorkflow,
  rentalCreationWorkflow,
  rentalEndingWorkflow,
} from './workflow';
import { RentalActivities } from './activities';
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
      const activitiesInstance = this.moduleRef.get(RentalActivities, {
        strict: false,
      });

      const isProduction = process.env.NODE_ENV === 'production';
      const workflowsPath = isProduction
        ? join(process.cwd(), 'src/saga/workflow.ts')
        : join(process.cwd(), 'apps/rental-service/src/saga/workflow.ts');

      const { NativeConnection } = await import('@temporalio/worker');
      const workerConnection = await NativeConnection.connect({
        address: process.env.TEMPORAL_ADDRESS || 'localhost:7233',
      });

      this.worker = await Worker.create({
        connection: workerConnection,
        workflowsPath,
        activities: {
          // Bike activities
          validateAvailableBike:
            activitiesInstance.validateAvailableBike.bind(activitiesInstance),
          updateBikeStatus:
            activitiesInstance.updateBikeStatus.bind(activitiesInstance),
          lockBike: activitiesInstance.lockBike.bind(activitiesInstance),
          unlockBike: activitiesInstance.unlockBike.bind(activitiesInstance),
          // Wallet & Payment activities
          verifyUserBalance:
            activitiesInstance.verifyUserBalance.bind(activitiesInstance),
          processPayment:
            activitiesInstance.processPayment.bind(activitiesInstance),
          // Rental activities
          calculateFees:
            activitiesInstance.calculateFees.bind(activitiesInstance),
          createRentalRecord:
            activitiesInstance.createRentalRecord.bind(activitiesInstance),
          voidRentalRecord:
            activitiesInstance.voidRentalRecord.bind(activitiesInstance),
          getRental: activitiesInstance.getRental.bind(activitiesInstance),
          completeRentalRecord:
            activitiesInstance.completeRentalRecord.bind(activitiesInstance),
          revertRentalRecord:
            activitiesInstance.revertRentalRecord.bind(activitiesInstance),
        },
        taskQueue: 'rental-queue',
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

  private getClient(): Client {
    if (!this.client) {
      throw new Error('Temporal client is not initialized');
    }
    return this.client;
  }

  async startRentalCreation(data: RentalCreationWorkflow): Promise<any> {
    const client = this.getClient();
    const handle = await client.workflow.start(rentalCreationWorkflow, {
      taskQueue: 'rental-queue',
      workflowId: `rental-creation-${data.bikeId}-${Date.now()}`,
      args: [data],
    });

    return await handle.result();
  }

  async startRentalEnding(data: {
    rentalId: string;
    endStationId: string;
  }): Promise<any> {
    const client = this.getClient();
    const handle = await client.workflow.start(rentalEndingWorkflow, {
      taskQueue: 'rental-queue',
      workflowId: `rental-ending-${data.rentalId}-${Date.now()}`,
      args: [data],
    });

    return await handle.result();
  }
}
