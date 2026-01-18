import {
  Injectable,
  Logger,
  OnApplicationBootstrap,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { Client, Connection } from '@temporalio/client';
import { Worker } from '@temporalio/worker';
import { rentalCreationWorkflow, rentalEndingWorkflow } from './workflow';
import { RentalActivities } from './activities';
import { ModuleRef } from '@nestjs/core';
import { join } from 'node:path';
import { CreateRentalDto, RentalModel } from '@mebike/common';

@Injectable()
export class TemporalService
  implements OnModuleInit, OnModuleDestroy, OnApplicationBootstrap
{
  private readonly logger = new Logger(TemporalService.name);
  private client!: Client;
  private worker?: Worker;

  constructor(private readonly moduleRef: ModuleRef) {
    this.logger.log('TemporalService instance created');
  }

  async onModuleInit() {
    this.logger.log('TemporalService.onModuleInit called');
    try {
      const address = process.env.TEMPORAL_ADDRESS || 'localhost:7233';
      this.logger.log(`Connecting to Temporal at: ${address}`);
      const connection = await Connection.connect({
        address,
      });
      this.logger.log('Temporal Connection established');
      this.client = new Client({
        connection,
      });
      this.logger.log(`Temporal Client created: ${!!this.client}`);
    } catch (err) {
      this.logger.error('Error in TemporalService.onModuleInit:', err);
      throw err;
    }
  }

  async onApplicationBootstrap() {
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
          rentBike: activitiesInstance.rentBike.bind(activitiesInstance),
          releaseBike: activitiesInstance.releaseBike.bind(activitiesInstance),
          verifyUserBalance:
            activitiesInstance.verifyUserBalance.bind(activitiesInstance),
          createRentalRecord:
            activitiesInstance.createRentalRecord.bind(activitiesInstance),
          voidRentalRecord:
            activitiesInstance.voidRentalRecord.bind(activitiesInstance),
          getRental: activitiesInstance.getRental.bind(activitiesInstance),
          calculateFees:
            activitiesInstance.calculateFees.bind(activitiesInstance),
          updateBikeStatus:
            activitiesInstance.updateBikeStatus.bind(activitiesInstance),
          completeRentalRecord:
            activitiesInstance.completeRentalRecord.bind(activitiesInstance),
          revertRentalRecord:
            activitiesInstance.revertRentalRecord.bind(activitiesInstance),
          processPayment:
            activitiesInstance.processPayment.bind(activitiesInstance),
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

  async startRentalCreation(
    data: CreateRentalDto & { minimumRent: number },
  ): Promise<RentalModel> {
    const client = this.getClient();
    const handle = await client.workflow.start(rentalCreationWorkflow, {
      taskQueue: 'rental-queue',
      workflowId: `rental-creation-${data.bikeId}-${Date.now()}`,
      args: [data],
    });

    return await handle.result();
  }

  async startRentalEnding(data: { rentalId: string }): Promise<RentalModel> {
    const client = this.getClient();
    const handle = await client.workflow.start(rentalEndingWorkflow, {
      taskQueue: 'rental-queue',
      workflowId: `rental-ending-${data.rentalId}-${Date.now()}`,
      args: [data],
    });

    return await handle.result();
  }
}
