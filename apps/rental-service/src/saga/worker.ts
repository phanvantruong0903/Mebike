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
      calculateFees: activitiesInstance.calculateFees.bind(activitiesInstance),
      createRentalRecord:
        activitiesInstance.createRentalRecord.bind(activitiesInstance),
      voidRentalRecord:
        activitiesInstance.voidRentalRecord.bind(activitiesInstance),
      getRental: activitiesInstance.getRental.bind(activitiesInstance),
      completeRentalRecord:
        activitiesInstance.completeRentalRecord.bind(activitiesInstance),
      revertRentalRecord:
        activitiesInstance.revertRentalRecord.bind(activitiesInstance),
      // Reservation activities
      createReservationRecord:
        activitiesInstance.createReservationRecord.bind(activitiesInstance),
      voidReservationRecord:
        activitiesInstance.voidReservationRecord.bind(activitiesInstance),
      activateReservation:
        activitiesInstance.activateReservation.bind(activitiesInstance),
      revertCompletedReservation:
        activitiesInstance.revertCompletedReservation.bind(activitiesInstance),
      cancelReservation:
        activitiesInstance.cancelReservation.bind(activitiesInstance),
      revertCancelledReservation:
        activitiesInstance.revertCancelledReservation.bind(activitiesInstance),
      // Subscription activities
      useSubscription:
        activitiesInstance.useSubscription.bind(activitiesInstance),
      revertSubscriptionUsage:
        activitiesInstance.revertSubscriptionUsage.bind(activitiesInstance),
    },
    taskQueue: 'rental-service',
  });

  await worker.run();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
