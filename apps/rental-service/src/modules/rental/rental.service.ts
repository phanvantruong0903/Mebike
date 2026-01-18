import {
  BaseService,
  Bike,
  BIKE_MESSAGES,
  BikeResponse,
  BikeStatus,
  CreateRentalDto,
  DebitRentalDto,
  EndRentalDto,
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
  TrendValue,
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
export class RentalService extends BaseService<RentalModel, CreateRentalDto> {
  private fleetService!: FleetServiceClient;
  private paymentService!: PaymentServiceClient;

  constructor(
    @Inject(GRPC_PACKAGE.FLEET) private readonly fleetClient: ClientGrpc,
    @Inject(GRPC_PACKAGE.PAYMENT) private readonly paymentClient: ClientGrpc,
  ) {
    super(prismaRental.rental);
    this.fleetService = this.fleetClient.getService<FleetServiceClient>(
      GRPC_SERVICES.FLEET,
    );
    this.paymentService = this.paymentClient.getService<PaymentServiceClient>(
      GRPC_SERVICES.PAYMENT,
    );
  }

  private getFleetService(): FleetServiceClient {
    if (!this.fleetService) {
      throwGrpcError(500, SERVER_MESSAGE.INTERNAL_SERVER, [
        `Failed to load ${GRPC_SERVICES.FLEET}. Check proto definitions.`,
      ]);
    }
    return this.fleetService;
  }

  private getPaymentService(): PaymentServiceClient {
    if (!this.paymentService) {
      throwGrpcError(500, SERVER_MESSAGE.INTERNAL_SERVER, [
        `Failed to load ${GRPC_SERVICES.PAYMENT}. Check proto definitions.`,
      ]);
    }
    return this.paymentService;
  }

  override async create(data: CreateRentalDto): Promise<RentalModel> {
    const bikeResponse = await this.getBikeById(data.bikeId);
    if (!bikeResponse || !bikeResponse.data) {
      throwGrpcError(404, SERVER_MESSAGE.NOT_FOUND, [BIKE_MESSAGES.NOT_FOUND]);
    }

    const bike = bikeResponse.data as Bike;
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

    const minimumRent = Number(process.env.RE_MINIMUM_RENT_AMOUNT || '2000');
    const hasEnoughBalance = await this.hasEnoughBalance(
      data.accountId,
      minimumRent,
    );
    if (!hasEnoughBalance) {
      throwGrpcError(400, SERVER_MESSAGE.BAD_REQUEST, [
        PAYMENT_MESSAGES.NOT_ENOUGH_BALANCE,
      ]);
    }

    const [createdRental] = await Promise.all([
      prismaRental.rental.create({
        data: {
          ...data,
          startStationId: bike.station.id,
        },
      }),
      this.changeBikeStatus(data.bikeId, BikeStatus.Booked),
    ]);

    return createdRental;
  }

  async end(data: EndRentalDto): Promise<RentalModel> {
    const rental = await prismaRental.rental.findUnique({
      where: { id: data.id, status: RentalStatus.Rented },
    });
    if (!rental) {
      throwGrpcError(404, SERVER_MESSAGE.NOT_FOUND, [
        RENTAL_MESSAGES.NOT_FOUND_WITH_STATUS(RentalStatus.Rented),
      ]);
    }

    const now = new Date();
    const duration = this.generateDuration(rental.startTime, now);
    const totalPrice = this.generateTotalPrice(duration);

    if (!rental.bikeId) {
      throw new Error(RENTAL_MESSAGES.FIELD_NOT_FOUND('bikeId'));
    }

    const [updatedRental] = await Promise.all([
      prismaRental.rental.update({
        where: { id: data.id },
        data: {
          endStationId: rental.startStationId,
          endTime: now,
          duration: duration,
          totalPrice: totalPrice,
          status: RentalStatus.Completed,
        },
      }),
      this.rentalPayment(rental.accountId, totalPrice, rental.id),
      this.changeBikeStatus(rental.bikeId, BikeStatus.Available),
    ]);

    return updatedRental;
  }

  async getOne(id: string): Promise<RentalModel | null> {
    const rental = await prismaRental.rental.findUnique({
      where: { id },
    });
    if (!rental) {
      throwGrpcError(404, SERVER_MESSAGE.NOT_FOUND, [
        RENTAL_MESSAGES.NOT_FOUND,
      ]);
    }
    return rental;
  }

  // Get revenue summary
  async getRevenueSummaryByDate(date: string) {
    const startOfDate = new Date(date);
    startOfDate.setHours(0, 0, 0, 0);
    console.log('startOfDate: ', startOfDate);

    const endOfDate = new Date(date);
    endOfDate.setHours(23, 59, 59, 999);
    console.log('endOfDate: ', endOfDate);

    // Last date
    const startOfLastDate = new Date(startOfDate);
    startOfLastDate.setDate(startOfLastDate.getDate() - 1);
    console.log('startOfLastDate: ', startOfLastDate);

    const endOfLastDate = new Date(startOfDate);
    endOfLastDate.setMilliseconds(-1);
    console.log('endOfLastDate: ', endOfLastDate);

    const aggregateRange = async (start: Date, end: Date) => {
      const result = await prismaRental.rental.aggregate({
        where: {
          status: RentalStatus.Completed,
          endTime: {
            gte: start,
            lte: end,
          },
        },
        _sum: {
          totalPrice: true,
        },
        _count: {
          _all: true,
        },
      });

      return {
        totalRevenue: result._sum.totalPrice ?? 0,
        totalRentals: result._count._all ?? 0,
      };
    };

    const [dateRevenue, lastDateRevenue] = await Promise.all([
      aggregateRange(startOfDate, endOfDate),
      aggregateRange(startOfLastDate, endOfLastDate),
    ]);

    const compare = (todayVal: number, yesterdayVal: number) => {
      if (yesterdayVal === 0) return todayVal > 0 ? 100 : 0;
      return ((todayVal - yesterdayVal) / yesterdayVal) * 100;
    };

    const revenueChange = compare(
      Number(dateRevenue.totalRevenue),
      Number(lastDateRevenue.totalRevenue),
    );
    const rentalChange = compare(
      dateRevenue.totalRentals,
      lastDateRevenue.totalRentals,
    );

    return {
      dateRevenue,
      lastDateRevenue,
      revenueChange,
      revenueTrend:
        revenueChange > 0
          ? TrendValue.Up
          : revenueChange < 0
          ? TrendValue.Down
          : TrendValue.NoChange,
      rentalChange,
      rentalTrend:
        rentalChange > 0
          ? TrendValue.Up
          : rentalChange < 0
          ? TrendValue.Down
          : TrendValue.NoChange,
    };
  }

  async getTodayRevenueSummary() {
    const now = new Date();
    return await this.getRevenueSummaryByDate(now.toString());
  }

  // Get rentals per hour
  async getRentalPerHourByDate(date: string) {
    const startOfDate = new Date(date);
    startOfDate.setHours(0, 0, 0, 0);

    const endOfDate = new Date(date);
    endOfDate.setHours(23, 59, 59, 999);

    const result = await prismaRental.rental.groupBy({
      by: ['startTime'],
      where: {
        startTime: {
          gte: startOfDate,
          lte: endOfDate,
        },
      },
      _count: {
        _all: true,
      },
      orderBy: {
        startTime: 'asc',
      },
    });

    const fullDay = Array.from({ length: 24 }, (_, hour) => {
      const found = result.find((g) => g.startTime.getTime() === hour);

      return {
        hour,
        totalRentals: found ? found._count._all : 0,
      };
    });

    return fullDay;
  }

  async getTodayRentalPerHour() {
    const now = new Date();
    return await this.getRentalPerHourByDate(now.toString());
  }

  generateDuration(start: Date, end: Date) {
    return Math.ceil((end.getTime() - start.getTime()) / 60000);
  }

  generateTotalPrice(minutes: number) {
    const halfHourUnit = Math.max(1, Math.ceil(minutes / 30));
    const pricePer30Min = Number(process.env.RE_PRICE_PER_30_MINS || '2000');
    return pricePer30Min * halfHourUnit;
  }

  // bike functions
  async getBikeById(id: string) {
    const service = this.getFleetService();
    return await firstValueFrom(service.GetBike({ id }));
  }

  async changeBikeStatus(id: string, status: BikeStatus) {
    const service = this.getFleetService();
    return await firstValueFrom(service.ChangeBikeStatus({ id, status }));
  }

  // wallet functions
  async hasEnoughBalance(accountId: string, amount: number) {
    const service = this.getPaymentService();
    const walletResponse = await firstValueFrom(
      service.GetWallet({ accountId }),
    );
    const wallet = walletResponse.data as Wallet;
    if (!wallet) {
      throwGrpcError(404, SERVER_MESSAGE.NOT_FOUND, [
        PAYMENT_MESSAGES.WALLET_NOT_FOUND,
      ]);
    }
    return wallet.balance >= amount;
  }

  async rentalPayment(accountId: string, amount: number, rentalId: string) {
    const service = this.getPaymentService();
    return await firstValueFrom(
      service.DebitRental({
        accountId,
        amount,
        transactionType: TransactionType.RENTALFEE,
        rentalId,
      }),
    );
  }
}
