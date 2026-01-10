import {
  BaseService,
  Bike,
  BIKE_MESSAGES,
  BikeResponse,
  BikeStatus,
  CreateRentalDto,
  EndRentalDto,
  GRPC_PACKAGE,
  GRPC_SERVICES,
  prismaRental,
  RENTAL_MESSAGES,
  RentalModel,
  RentalStatus,
  SERVER_MESSAGE,
  throwGrpcError,
  TrendValue,
} from '@mebike/common';
import {
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom, Observable } from 'rxjs';

interface FleetServiceClient {
  GetBike(data: { id: string }): Observable<BikeResponse>;
  ChangeBikeStatus(data: {
    id: string;
    status: BikeStatus;
  }): Observable<BikeResponse>;
}

@Injectable()
export class RentalService
  extends BaseService<RentalModel, CreateRentalDto>
  implements OnModuleInit
{
  private readonly logger = new Logger(RentalService.name);
  private fleetService!: FleetServiceClient;

  constructor(@Inject(GRPC_PACKAGE.FLEET) private readonly client: ClientGrpc) {
    super(prismaRental.rental);
  }

  onModuleInit() {
    this.initializeFleetService();
  }

  private initializeFleetService() {
    if (this.fleetService) return;

    if (!this.client) {
      this.logger.error('ClientGrpc is not injected!');
      return;
    }

    try {
      this.fleetService = this.client.getService<FleetServiceClient>(
        GRPC_SERVICES.FLEET,
      );
    } catch (error: any) {
      this.logger.warn(
        `Failed to load ${GRPC_SERVICES.FLEET}: ${error.message}`,
      );
    }

    if (this.fleetService) {
      this.logger.log('FleetService initialized successfully');
    } else {
      this.logger.error('Failed to initialize FleetService');
    }
  }

  private ensureFleetService() {
    if (!this.fleetService) {
      this.logger.warn('FleetService not initialized, attempting lazy load...');
      this.initializeFleetService();
    }
    if (!this.fleetService) {
      throw new InternalServerErrorException(
        'RentalService: FleetService dependency is missing. Check gRPC client configuration.',
      );
    }
    return this.fleetService;
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
    return await prismaRental.rental.create({
      data: {
        ...data,
        startStationId: bike.station?.id as string,
      },
    });
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
          ...data,
          endStationId: rental.startStationId,
          endTime: now,
          duration: duration,
          totalPrice: totalPrice,
          status: RentalStatus.Completed,
        },
      }),
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
    const pricePer30Min = Number(process.env.PRICE_PER_30_MINS || '2000');
    return pricePer30Min * halfHourUnit;
  }

  // bike functions
  async getBikeById(id: string) {
    return await firstValueFrom(this.ensureFleetService().GetBike({ id }));
  }

  async changeBikeStatus(id: string, status: BikeStatus) {
    return await firstValueFrom(
      this.ensureFleetService().ChangeBikeStatus({ id, status }),
    );
  }
}
