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
  Wallet,
  WalletResponse,
} from '@mebike/common';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { type ClientGrpc } from '@nestjs/microservices';
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
  private readonly logger = new Logger(RentalActivities.name);

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

  async validateAvailableBike(
    bikeId: string,
  ): Promise<{ bikeId: string; stationId: string }> {
    const bikeResponse = await firstValueFrom(
      this.fleetService.GetBike({ id: bikeId }),
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

  // Create Rental Activities

  async lockBike(bikeId: string): Promise<void> {
    console.log('[COMPENSATION] Locking bike:', bikeId);
    try {
      await firstValueFrom(
        this.fleetService.ChangeBikeStatus({
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
        this.fleetService.ChangeBikeStatus({
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
        this.paymentService.GetWallet({ accountId }),
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
      this.logger.debug(error);
      const errorObj = error?.error || error;
      throw new Error(JSON.stringify(errorObj));
    }
  }

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

  // End Rental Activities

  async getRental(rentalId: string): Promise<RentalModel> {
    const rental = await prismaRental.rental.findUnique({
      where: { id: rentalId },
    });
    if (!rental) throw new Error(RENTAL_MESSAGES.NOT_FOUND);
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
