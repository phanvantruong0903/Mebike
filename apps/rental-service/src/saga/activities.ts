import {
  Bike,
  BIKE_MESSAGES,
  BikeResponse,
  BikeStatus,
  CreateRentalDto,
  DebitRentalDto,
  GRPC_PACKAGE,
  GRPC_SERVICES,
  PAYMENT_MESSAGES,
  prismaRental,
  RENTAL_MESSAGES,
  RentalModel,
  RentalStatus,
  SERVER_MESSAGE,
  throwGrpcError,
  TransactionType,
  Wallet,
  WalletResponse,
} from '@mebike/common';
import { Inject, Injectable } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom, Observable } from 'rxjs';

interface FleetServiceClient {
  GetBike(data: { id: string }): Observable<BikeResponse>;
  ChangeBikeStatus(data: {
    id: string;
    status: BikeStatus;
  }): Observable<BikeResponse>;
}

interface PaymentServiceClient {
  GetWallet(data: { accountId: string }): Observable<WalletResponse>;
  DebitRental(data: DebitRentalDto): Observable<WalletResponse>;
}

@Injectable()
export class RentalActivities {
  private fleetService!: FleetServiceClient;
  private paymentService!: PaymentServiceClient;

  constructor(
    @Inject(GRPC_PACKAGE.FLEET) private readonly fleetClient: ClientGrpc,
    @Inject(GRPC_PACKAGE.PAYMENT) private readonly paymentClient: ClientGrpc,
  ) {
    this.fleetService = this.fleetClient.getService<FleetServiceClient>(
      GRPC_SERVICES.FLEET,
    );
    this.paymentService = this.paymentClient.getService<PaymentServiceClient>(
      GRPC_SERVICES.PAYMENT,
    );
  }

  // Create Rental Activities

  async rentBike(bikeId: string): Promise<void> {
    try {
      const bikeResponse = await firstValueFrom(
        this.fleetService.GetBike({ id: bikeId }),
      );
      const bike = bikeResponse.data as Bike;

      if (!bike) {
        throwGrpcError(404, SERVER_MESSAGE.NOT_FOUND, [
          BIKE_MESSAGES.NOT_FOUND,
        ]);
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

      await firstValueFrom(
        this.fleetService.ChangeBikeStatus({
          id: bikeId,
          status: BikeStatus.Booked,
        }),
      );
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      throwGrpcError(500, SERVER_MESSAGE.INTERNAL_SERVER, [msg]);
    }
  }

  async releaseBike(bikeId: string): Promise<void> {
    console.log('[COMPENSATION] Releasing bike:', bikeId);
    try {
      await firstValueFrom(
        this.fleetService.ChangeBikeStatus({
          id: bikeId,
          status: BikeStatus.Available,
        }),
      );
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      console.error('[COMPENSATION] Failed to release bike:', msg);
    }
  }

  async verifyUserBalance(
    accountId: string,
    minimumAmount: number,
  ): Promise<void> {
    try {
      const walletResponse = await firstValueFrom(
        this.paymentService.GetWallet({ accountId }),
      );
      const wallet = walletResponse.data as Wallet;
      if (!wallet) {
        throwGrpcError(404, SERVER_MESSAGE.NOT_FOUND, [
          PAYMENT_MESSAGES.WALLET_NOT_FOUND,
        ]);
      }
      if (wallet.balance < minimumAmount) {
        throwGrpcError(400, SERVER_MESSAGE.BAD_REQUEST, [
          PAYMENT_MESSAGES.NOT_ENOUGH_BALANCE,
        ]);
      }
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      throwGrpcError(500, SERVER_MESSAGE.INTERNAL_SERVER, [msg]);
    }
  }

  async createRentalRecord(data: CreateRentalDto): Promise<RentalModel> {
    const bikeResponse = await firstValueFrom(
      this.fleetService.GetBike({ id: data.bikeId }),
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

    try {
      return await prismaRental.rental.create({
        data: {
          ...data,
          startStationId: bike.station.id,
        },
      });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      throwGrpcError(500, SERVER_MESSAGE.INTERNAL_SERVER, [
        'Failed to create rental record: ' + msg,
      ]);
    }
  }

  async voidRentalRecord(rentalId: string): Promise<void> {
    console.log('[COMPENSATION] Voiding rental:', rentalId);
    try {
      await prismaRental.rental.delete({ where: { id: rentalId } });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      console.error('[COMPENSATION] Failed to void rental:', msg);
    }
  }

  // End Rental Activities

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
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      throwGrpcError(500, SERVER_MESSAGE.INTERNAL_SERVER, [
        'Failed to complete rental record: ' + msg,
      ]);
    }
  }

  async revertRentalRecord(rentalId: string): Promise<void> {
    console.log('[COMPENSATION] Reverting rental record to Rented:', rentalId);
    try {
      await prismaRental.rental.update({
        where: { id: rentalId },
        data: {
          status: RentalStatus.Rented,
          endTime: null as any,
          totalPrice: null as any,
          duration: null as any,
        },
      });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      console.error('[COMPENSATION] Failed to revert rental record:', msg);
    }
  }

  async updateBikeStatus(data: {
    id: string;
    status: BikeStatus;
  }): Promise<void> {
    try {
      await firstValueFrom(
        this.fleetService.ChangeBikeStatus({
          id: data.id,
          status: data.status,
        }),
      );
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      throwGrpcError(500, SERVER_MESSAGE.INTERNAL_SERVER, [
        'Failed to update bike status: ' + msg,
      ]);
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
          transactionType: TransactionType.RENTALFEE,
          rentalId: data.rentalId,
        }),
      );
      if (!response.success && response.message !== 'Success') {
        if (response.success === false)
          throw new Error(response.message || 'Payment Failed');
      }
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      throwGrpcError(500, SERVER_MESSAGE.INTERNAL_SERVER, [
        'Payment processing failed: ' + msg,
      ]);
    }
  }
}
