import { proxyActivities } from '@temporalio/workflow';
import type { RentalActivities } from './activities';

const {
  validateAvailableBike,
  updateBikeStatus,
  lockBike,
  unlockBike,
  verifyUserBalance,
  createRentalRecord,
  voidRentalRecord,
  getRental,
  calculateFees,
  completeRentalRecord,
  revertRentalRecord,
  processPayment,
} = proxyActivities<RentalActivities>({
  startToCloseTimeout: '1 minute',
  retry: {
    maximumAttempts: 1,
  },
});

export interface RentalCreationWorkflow {
  accountId: string;
  bikeId: string;
  subscriptionId?: string;
  minimumRent: number;
}

export async function rentalCreationWorkflow(
  data: RentalCreationWorkflow,
): Promise<any> {
  let bikeLocked = false;
  let rentalId: string | undefined;
  try {
    await verifyUserBalance(data.accountId, data.minimumRent);
    const { bikeId, stationId } = await validateAvailableBike(data.bikeId);

    await updateBikeStatus({
      id: bikeId,
      status: 'Booked',
    });
    bikeLocked = true;

    const rental = await createRentalRecord(data, stationId);
    rentalId = rental.id;

    return {
      success: true,
      data: rental,
    };
  } catch (error: any) {
    if (rentalId) {
      await voidRentalRecord(rentalId);
    }
    if (bikeLocked) {
      await unlockBike(data.bikeId);
    }
    let errorMessage = 'Unknown error';
    let statusCode = 500;
    let errorList: string[] | undefined;

    if (error && typeof error === 'object') {
      let rawMessage = '';

      if ('cause' in error && error.cause && typeof error.cause === 'object') {
        if (
          'failure' in error.cause &&
          error.cause.failure &&
          typeof error.cause.failure === 'object' &&
          'message' in error.cause.failure
        ) {
          rawMessage = String(error.cause.failure.message);
        }
      } else if (
        'failure' in error &&
        error.failure &&
        typeof error.failure === 'object'
      ) {
        if (
          'cause' in error.failure &&
          error.failure.cause &&
          typeof error.failure.cause === 'object' &&
          'message' in error.failure.cause
        ) {
          rawMessage = String(error.failure.cause.message);
        }
      } else if ('message' in error) {
        rawMessage = String(error.message);
      }

      if (rawMessage) {
        try {
          const parsed = JSON.parse(rawMessage);
          errorMessage = parsed.message || rawMessage;
          statusCode = parsed.statusCode;
          errorList = parsed.errors;
        } catch {
          errorMessage = rawMessage;
        }
      }
    }

    return {
      success: false,
      message: errorMessage,
      errors: errorList || [errorMessage],
      statusCode,
    };
  }
}

export async function rentalEndingWorkflow(data: {
  rentalId: string;
  endStationId: string;
}): Promise<any> {
  const rental = await getRental(data.rentalId);
  const now = new Date();
  const { duration, total } = await calculateFees({
    start: rental.startTime,
    end: now,
  });

  await verifyUserBalance(rental.accountId, total);

  const bikeId = rental.bikeId as string;
  await unlockBike(bikeId);

  let updatedRental: any;
  try {
    updatedRental = await completeRentalRecord({
      rentalId: rental.id,
      endStationId: rental.startStationId,
      endTime: now,
      duration,
      totalPrice: total,
    });

    try {
      await processPayment({
        accountId: rental.accountId,
        amount: total,
        rentalId: rental.id,
      });
    } catch (paymentError) {
      console.error('Payment failed, rolling back rental completion...');

      await revertRentalRecord(rental.id);

      await lockBike(bikeId);

      throw paymentError;
    }
  } catch (error) {
    await lockBike(bikeId);
    let errorMessage = 'Unknown error';
    let statusCode = 500;
    let errorList: string[] | undefined;

    if (error && typeof error === 'object') {
      let rawMessage = '';

      if ('cause' in error && error.cause && typeof error.cause === 'object') {
        if (
          'failure' in error.cause &&
          error.cause.failure &&
          typeof error.cause.failure === 'object' &&
          'message' in error.cause.failure
        ) {
          rawMessage = String(error.cause.failure.message);
        }
      } else if (
        'failure' in error &&
        error.failure &&
        typeof error.failure === 'object'
      ) {
        if (
          'cause' in error.failure &&
          error.failure.cause &&
          typeof error.failure.cause === 'object' &&
          'message' in error.failure.cause
        ) {
          rawMessage = String(error.failure.cause.message);
        }
      } else if ('message' in error) {
        rawMessage = String(error.message);
      }

      if (rawMessage) {
        try {
          const parsed = JSON.parse(rawMessage);
          errorMessage = parsed.message || rawMessage;
          statusCode = parsed.statusCode;
          errorList = parsed.errors;
        } catch {
          errorMessage = rawMessage;
        }
      }
    }

    return {
      success: false,
      message: errorMessage,
      errors: errorList || [errorMessage],
      statusCode,
    };
  }

  return {
    success: true,
    data: updatedRental,
  };
}
