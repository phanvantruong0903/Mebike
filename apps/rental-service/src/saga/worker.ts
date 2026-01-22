import { NestFactory } from '@nestjs/core';
import { SagaModule } from './saga.module';
import { Worker } from '@temporalio/worker';
import { RentalActivities } from './activities';

async function run() {
  const app = await NestFactory.createApplicationContext(SagaModule);
  const activitiesInstance = app.get(RentalActivities);

  const worker = await Worker.create({
    workflowsPath: require.resolve('./workflow'),
    activities: {
      validateAvailableBike:
        activitiesInstance.validateAvailableBike.bind(activitiesInstance),
      lockBike: activitiesInstance.lockBike.bind(activitiesInstance),
      unlockBike: activitiesInstance.unlockBike.bind(activitiesInstance),
      verifyUserBalance:
        activitiesInstance.verifyUserBalance.bind(activitiesInstance),
      createRentalRecord:
        activitiesInstance.createRentalRecord.bind(activitiesInstance),
      voidRentalRecord:
        activitiesInstance.voidRentalRecord.bind(activitiesInstance),
      getRental: activitiesInstance.getRental.bind(activitiesInstance),
      calculateFees: activitiesInstance.calculateFees.bind(activitiesInstance),
      updateBikeStatus:
        activitiesInstance.updateBikeStatus.bind(activitiesInstance),
      completeRentalRecord:
        activitiesInstance.completeRentalRecord.bind(activitiesInstance),
      revertRentalRecord:
        activitiesInstance.revertRentalRecord.bind(activitiesInstance),
      processPayment:
        activitiesInstance.processPayment.bind(activitiesInstance),
    },
    taskQueue: 'rental-service',
  });

  await worker.run();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
