import { proxyActivities } from '@temporalio/workflow';

const { changeBikeStatus, createSos, deleteSos } = proxyActivities({
  startToCloseTimeout: '1 minute',
  retry: {
    maximumAttempts: 1,
  },
});

export interface SosCreationWorkflow {
  rentalId: string;
  requesterId: string;
  issue: string;
  photos: string[];
  isContinuingRental: boolean;
  latitude: number;
  longitude: number;
}

export async function sosCreationWorkflow(data: SosCreationWorkflow): Promise<{
  success: boolean;
  data?: any;
  message?: string;
  errors?: string[];
  statusCode?: number;
}> {
  let sosId: string | undefined;
  try {
    let isSuccess = false;
    const sos = await createSos({
      rentalId: data.rentalId,
      requesterId: data.requesterId,
      issue: data.issue,
      photos: data.photos,
      isContinuingRental: data.isContinuingRental,
      latitude: data.latitude,
      longitude: data.longitude,
    });
    sosId = sos.id;
    const bikeId = sos.bikeId;
    if (data.isContinuingRental) {
      await changeBikeStatus({
        id: bikeId,
        status: 'Unavailable',
      });
    }
    isSuccess = true;
    if (!isSuccess) {
      await deleteSos({
        id: sosId,
      });
    }

    return { success: true, data: sos };
  } catch (error) {
    if (sosId)
      await deleteSos({
        id: sosId,
      });

    let errorMessage = 'Unknown error';
    let statusCode = 500;

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
        } catch {
          errorMessage = rawMessage;
        }
      }
    }

    return {
      success: false,
      message: errorMessage,
      errors: [errorMessage],
      statusCode,
    };
  }
}
