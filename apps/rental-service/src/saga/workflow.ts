import {
  CreateRentalDto,
  RentalModel,
  BikeStatus,
  RENTAL_MESSAGES,
} from '@mebike/common';
import { proxyActivities } from '@temporalio/workflow';
import type { RentalActivities } from './activities';

const {
  rentBike,
  releaseBike,
  verifyUserBalance,
  createRentalRecord,
  getRental,
  calculateFees,
  updateBikeStatus,
  completeRentalRecord,
  processPayment,
} = proxyActivities<RentalActivities>({
  startToCloseTimeout: '1 minute',
  retry: {
    maximumAttempts: 3,
  },
});

export async function rentalCreationWorkflow(
  data: CreateRentalDto & { minimumRent: number },
): Promise<RentalModel> {
  await verifyUserBalance(data.accountId, data.minimumRent);

  await rentBike(data.bikeId);

  let rental: RentalModel;
  try {
    rental = await createRentalRecord(data);
  } catch (error) {
    await releaseBike(data.bikeId);
    throw error;
  }

  return rental;
}

export async function rentalEndingWorkflow(data: {
  rentalId: string;
}): Promise<RentalModel> {
  const rental = await getRental(data.rentalId);
  const now = new Date();
  const { duration, total } = await calculateFees({
    start: rental.startTime,
    end: now,
  });

  if (!rental.bikeId) {
    throw new Error(RENTAL_MESSAGES.BIKE_NOT_ASSIGNED);
  }

  await updateBikeStatus({
    id: rental.bikeId,
    status: BikeStatus.Available,
  });

  let updatedRental: RentalModel;
  try {
    updatedRental = await completeRentalRecord({
      rentalId: rental.id,
      endStationId: rental.startStationId,
      endTime: now,
      duration,
      totalPrice: total,
    });
  } catch (error) {
    await updateBikeStatus({ id: rental.bikeId, status: BikeStatus.Booked });
    throw error;
  }

  await processPayment({
    accountId: rental.accountId,
    amount: total,
    rentalId: rental.id,
  });

  return updatedRental;
}
