import {
  ApiResponse,
  Bike,
  BIKE_MESSAGES,
  BikeResponse,
  BikeStatus,
  CreateRentalDto,
  CreateReservationDto,
  DebitRentalDto,
  GRPC_PACKAGE,
  GRPC_SERVICES,
  PAYMENT_MESSAGES,
  prismaRental,
  RENTAL_MESSAGES,
  RentalModel,
  RentalStatus,
  ReservationModel,
  ReservationStatus,
  SERVER_MESSAGE,
  SubscriptionResponse,
  throwGrpcError,
  Wallet,
  WalletResponse,
} from '@mebike/common';
import { Inject, Injectable } from '@nestjs/common';
import { type ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom, Observable } from 'rxjs';
import { ReservationService } from '../modules/reservation/reservation.service';

interface BikeServiceClient {
  GetBike(data: { id: string }): Observable<BikeResponse>;
  ChangeBikeStatus(data: {
    id: string;
    status: BikeStatus;
  }): Observable<BikeResponse>;
}

interface PaymentServiceClient {
  DebitRental(data: DebitRentalDto): Observable<ApiResponse>;
}

interface WalletServiceClient {
  GetWallet(data: { accountId: string }): Observable<WalletResponse>;
}

interface SubscriptionServiceClient {
  UseSubscription(data: {
    subscriptionId: string;
    count: number;
  }): Observable<SubscriptionResponse>;
  RevertSubscriptionUsage(data: {
    subscriptionId: string;
    count: number;
  }): Observable<SubscriptionResponse>;
}

@Injectable()
export class RentalActivities {
  private bikeService!: BikeServiceClient;
  private paymentService!: PaymentServiceClient;
  private walletService!: WalletServiceClient;
  private subscriptionService!: SubscriptionServiceClient;

  constructor(
    @Inject(GRPC_PACKAGE.BIKE) private readonly fleetClient: ClientGrpc,
    @Inject(GRPC_PACKAGE.PAYMENT) private readonly paymentClient: ClientGrpc,
    @Inject(GRPC_PACKAGE.WALLET) private readonly walletClient: ClientGrpc,
    @Inject(GRPC_PACKAGE.SUBSCRIPTION)
    private readonly subscriptionClient: ClientGrpc,
    private readonly reservationService: ReservationService,
  ) {
    this.bikeService = this.fleetClient.getService<BikeServiceClient>(
      GRPC_SERVICES.FLEET,
    );
    this.paymentService = this.paymentClient.getService<PaymentServiceClient>(
      GRPC_SERVICES.PAYMENT,
    );
    this.walletService = this.walletClient.getService<WalletServiceClient>(
      GRPC_SERVICES.PAYMENT,
    );
    this.subscriptionService =
      this.subscriptionClient.getService<SubscriptionServiceClient>(
        GRPC_SERVICES.MEMBERSHIP,
      );
  }

  async validateAvailableBike(
    bikeId: string,
  ): Promise<{ bikeId: string; stationId: string }> {
    const bikeResponse = await firstValueFrom(
      this.bikeService.GetBike({ id: bikeId }),
    );
    const bike = bikeResponse.data as Bike;

    if (!bike) {
      throwGrpcError(404, SERVER_MESSAGE.NOT_FOUND, [BIKE_MESSAGES.NOT_FOUND]);
    }
    if (bike.status !== BikeStatus.Available) {
      throwGrpcError(400, SERVER_MESSAGE.BAD_REQUEST, [
        BIKE_MESSAGES.NOT_AVAILABLE,
      ]);
    }
    if (!bike.station?.id) {
      throwGrpcError(400, SERVER_MESSAGE.BAD_REQUEST, [
        BIKE_MESSAGES.NOT_ASSIGNED_STATION,
      ]);
    }
    return {
      bikeId: bike.id,
      stationId: bike.station.id,
    };
  }

  async lockBike(bikeId: string): Promise<void> {
    console.log('[COMPENSATION] Locking bike:', bikeId);
    try {
      await firstValueFrom(
        this.bikeService.ChangeBikeStatus({
          id: bikeId,
          status: BikeStatus.Booked,
        }),
      );
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      console.error('[COMPENSATION] Failed to lock bike:', msg);
    }
  }

  async unlockBike(bikeId: string): Promise<void> {
    console.log('[COMPENSATION] Unlocking bike:', bikeId);
    try {
      await firstValueFrom(
        this.bikeService.ChangeBikeStatus({
          id: bikeId,
          status: BikeStatus.Available,
        }),
      );
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      console.error('[COMPENSATION] Failed to unlock bike:', msg);
    }
  }

  async verifyUserBalance(accountId: string, amount: number): Promise<void> {
    try {
      const walletResponse = await firstValueFrom(
        this.walletService.GetWallet({ accountId }),
      );
      const wallet = walletResponse.data as Wallet;
      if (!wallet) {
        throwGrpcError(404, SERVER_MESSAGE.NOT_FOUND, [
          PAYMENT_MESSAGES.WALLET_NOT_FOUND,
        ]);
      }
      if (wallet.balance < amount) {
        throwGrpcError(400, SERVER_MESSAGE.BAD_REQUEST, [
          PAYMENT_MESSAGES.NOT_ENOUGH_BALANCE,
        ]);
      }
    } catch (error: any) {
      const errorObj = error?.error || error;
      throw new Error(JSON.stringify(errorObj));
    }
  }

  // Rental Activities

  async createRentalRecord(
    data: CreateRentalDto,
    stationId: string,
  ): Promise<RentalModel> {
    try {
      return await prismaRental.rental.create({
        data: {
          ...data,
          startStationId: stationId,
        },
      });
    } catch (error: any) {
      const errorObj = error?.error || error;
      throw new Error(JSON.stringify(errorObj));
    }
  }

  async voidRentalRecord(rentalId: string): Promise<void> {
    console.log('[COMPENSATION] Voiding rental:', rentalId);
    try {
      const res = await prismaRental.rental.delete({ where: { id: rentalId } });
      if (!res) {
        console.warn('[COMPENSATION] Voided rental failed:', rentalId);
      } else {
        console.log('[COMPENSATION] Voided rental success:', rentalId);
      }
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      console.error('[COMPENSATION] Failed to void rental:', msg);
    }
  }

  async getRental(rentalId: string): Promise<RentalModel> {
    const rental = await prismaRental.rental.findUnique({
      where: { id: rentalId },
    });
    if (!rental)
      throwGrpcError(404, SERVER_MESSAGE.NOT_FOUND, [
        RENTAL_MESSAGES.NOT_FOUND,
      ]);
    return rental;
  }

  async calculateFees(data: {
    start: string | Date;
    end: string | Date;
  }): Promise<{ duration: number; total: number }> {
    const startTime = new Date(data.start);
    const endTime = new Date(data.end);
    const duration = Math.ceil(
      (endTime.getTime() - startTime.getTime()) / 60000,
    );
    const halfHourUnit = Math.max(1, Math.ceil(duration / 30));
    const pricePer30Min = Number(process.env.RE_PRICE_PER_30_MINS || '2000');
    const total = pricePer30Min * halfHourUnit;
    return { duration, total };
  }

  async completeRentalRecord(data: {
    rentalId: string;
    endStationId: string;
    endTime: string | Date;
    duration: number;
    totalPrice: number;
  }): Promise<RentalModel> {
    try {
      return await prismaRental.rental.update({
        where: { id: data.rentalId },
        data: {
          endStationId: data.endStationId,
          endTime: data.endTime,
          duration: data.duration,
          totalPrice: data.totalPrice,
          status: RentalStatus.Completed,
        },
      });
    } catch (error: any) {
      const errorObj = error?.error || error;
      throw new Error(JSON.stringify(errorObj));
    }
  }

  async revertRentalRecord(rentalId: string): Promise<void> {
    console.log('[COMPENSATION] Reverting rental record to Rented:', rentalId);
    try {
      const res = await prismaRental.rental.update({
        where: { id: rentalId },
        data: {
          status: RentalStatus.Rented,
          endTime: null as any,
          totalPrice: null as any,
          duration: null as any,
        },
      });
      if (!res) {
        console.warn('[COMPENSATION] Reverted rental record failed:', rentalId);
      } else {
        console.log('[COMPENSATION] Reverted rental record success:', rentalId);
      }
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      console.error('[COMPENSATION] Failed to revert rental record:', msg);
    }
  }

  // Reservation Activities

  async createReservationRecord(
    data: CreateReservationDto,
    stationId: string,
  ): Promise<ReservationModel> {
    try {
      return await prismaRental.reservation.create({
        data: {
          ...data,
          stationId,
          endTime: this.reservationService.generateEndTime(data.startTime),
        },
      });
    } catch (error: any) {
      const errorObj = error?.error || error;
      throw new Error(JSON.stringify(errorObj));
    }
  }

  async voidReservationRecord(reservationId: string): Promise<void> {
    console.log('[COMPENSATION] Voiding reservation:', reservationId);
    try {
      const res = await prismaRental.reservation.delete({
        where: { id: reservationId },
      });

      if (!res) {
        console.warn(
          '[COMPENSATION] Voided reservation failed:',
          reservationId,
        );
      } else {
        console.log(
          '[COMPENSATION] Voided reservation success:',
          reservationId,
        );
      }
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      console.error('[COMPENSATION] Failed to void reservation:', msg);
    }
  }

  async activateReservation(
    reservation: ReservationModel,
  ): Promise<ReservationModel> {
    try {
      const [completedReservation] = await prismaRental.$transaction([
        prismaRental.reservation.update({
          where: { id: reservation.id, status: ReservationStatus.Pending },
          data: {
            status: ReservationStatus.Completed,
          },
        }),
        prismaRental.rental.create({
          data: {
            accountId: reservation.accountId,
            bikeId: reservation.bikeId,
            startStationId: reservation.stationId,
          },
        }),
      ]);
      return completedReservation;
    } catch (error: any) {
      const errorObj = error?.error || error;
      throw new Error(JSON.stringify(errorObj));
    }
  }

  async revertCompletedReservation(reservationId: string) {
    console.log('[COMPENSATION] Revert reservation:', reservationId);
    try {
      const res = await prismaRental.$transaction([
        prismaRental.reservation.update({
          where: { id: reservationId, status: ReservationStatus.Completed },
          data: { status: ReservationStatus.Pending },
        }),
        prismaRental.rental.delete({
          where: { reservationId },
        }),
      ]);

      if (!res) {
        console.warn(
          '[COMPENSATION] Revert reservation failed:',
          reservationId,
        );
      } else {
        console.log(
          '[COMPENSATION] Revert reservation success:',
          reservationId,
        );
      }
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      console.error('[COMPENSATION] Failed to revert reservation:', msg);
    }
  }

  async cancelReservation(reservationId: string): Promise<ReservationModel> {
    try {
      return await prismaRental.reservation.update({
        where: { id: reservationId, status: ReservationStatus.Pending },
        data: {
          status: ReservationStatus.Cancelled,
        },
      });
    } catch (error: any) {
      const errorObj = error?.error || error;
      throw new Error(JSON.stringify(errorObj));
    }
  }

  async revertCancelledReservation(reservationId: string) {
    console.log('[COMPENSATION] Revert reservation:', reservationId);
    try {
      const res = await prismaRental.reservation.update({
        where: { id: reservationId, status: ReservationStatus.Cancelled },
        data: { status: ReservationStatus.Pending },
      });

      if (!res) {
        console.warn(
          '[COMPENSATION] Revert reservation failed:',
          reservationId,
        );
      } else {
        console.log(
          '[COMPENSATION] Revert reservation success:',
          reservationId,
        );
      }
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      console.error('[COMPENSATION] Failed to revert reservation:', msg);
    }
  }

  // Subscription Activities
  async useSubscription(data: {
    subscriptionId: string;
    count: number;
  }): Promise<SubscriptionResponse> {
    try {
      return await firstValueFrom(
        this.subscriptionService.UseSubscription({
          subscriptionId: data.subscriptionId,
          count: data.count,
        }),
      );
    } catch (error: any) {
      const errorObj = error?.error || error;
      throw new Error(JSON.stringify(errorObj));
    }
  }

  async revertSubscriptionUsage(data: {
    subscriptionId: string;
    count: number;
  }): Promise<void> {
    console.log(
      '[COMPENSATION] Revert subscription usage:',
      data.subscriptionId,
    );
    try {
      const res = await firstValueFrom(
        this.subscriptionService.RevertSubscriptionUsage({
          subscriptionId: data.subscriptionId,
          count: data.count,
        }),
      );

      if (!res) {
        console.warn(
          '[COMPENSATION] Revert subscription usage failed:',
          data.subscriptionId,
        );
      } else {
        console.log(
          '[COMPENSATION] Revert subscription usage success:',
          data.subscriptionId,
        );
      }
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      console.error('[COMPENSATION] Failed to revert subscription usage:', msg);
    }
  }

  async updateBikeStatus(data: {
    id: string;
    status: BikeStatus;
  }): Promise<void> {
    try {
      await firstValueFrom(
        this.bikeService.ChangeBikeStatus({
          id: data.id,
          status: data.status,
        }),
      );
    } catch (error: any) {
      const errorObj = error?.error || error;
      throw new Error(JSON.stringify(errorObj));
    }
  }

  async processPayment(data: {
    accountId: string;
    amount: number;
    rentalId: string;
  }): Promise<void> {
    try {
      const response = await firstValueFrom(
        this.paymentService.DebitRental({
          accountId: data.accountId,
          amount: data.amount,
          rentalId: data.rentalId,
        }),
      );
      if (!response.success && response.message !== 'Success') {
        if (response.success === false)
          throw new Error(response.message || 'Payment Failed');
      }
    } catch (error: any) {
      const errorObj = error?.error || error;
      throw new Error(JSON.stringify(errorObj));
    }
  }
}
