import {
  BaseService,
  CreateRentalDto,
  EndRentalDto,
  prismaRental,
  RENTAL_MESSAGES,
  RentalModel,
  RentalStatus,
  SERVER_MESSAGE,
  throwGrpcError,
  TrendValue,
} from '@mebike/common';
import { Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { TemporalService } from '../../saga/temporal-service';

@Injectable()
export class RentalService extends BaseService<RentalModel, CreateRentalDto> {
  constructor(private readonly temporalService: TemporalService) {
    super(prismaRental.rental);
  }

  override async create(data: CreateRentalDto): Promise<RentalModel> {
    const minimumRent = Number(process.env.RE_MINIMUM_RENT_AMOUNT || '2000');
    try {
      const result = await this.temporalService.startRentalCreation({
        ...data,
        minimumRent,
      });

      if (!result.success) {
        throwGrpcError(
          result.statusCode || 500,
          result.message || SERVER_MESSAGE.INTERNAL_SERVER,
          result.errors,
        );
      }

      return result.data;
    } catch (error: unknown) {
      if (error instanceof RpcException) {
        throw error;
      }
      const msg =
        error instanceof Error ? error.message : 'Rental creation failed';
      throwGrpcError(500, SERVER_MESSAGE.INTERNAL_SERVER, [msg]);
    }
  }

  async end(data: EndRentalDto): Promise<RentalModel> {
    try {
      const result = await this.temporalService.startRentalEnding({
        rentalId: data.id,
        endStationId: data.endStationId,
      });

      if (!result.success) {
        throwGrpcError(
          result.statusCode || 500,
          result.message || SERVER_MESSAGE.INTERNAL_SERVER,
          result.errors,
        );
      }

      return result.data;
    } catch (error: unknown) {
      if (error instanceof RpcException) {
        throw error;
      }
      const msg =
        error instanceof Error ? error.message : 'Rental ending failed';
      throwGrpcError(500, SERVER_MESSAGE.INTERNAL_SERVER, [msg]);
    }
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

    const rentals = await prismaRental.rental.findMany({
      where: {
        startTime: {
          gte: startOfDate,
          lte: endOfDate,
        },
      },
      select: {
        startTime: true,
      },
    });

    const hourCounts = new Map<number, number>();
    rentals.forEach((rental) => {
      const hour = rental.startTime.getHours();
      hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1);
    });

    const fullDay = Array.from({ length: 24 }, (_, hour) => {
      return {
        hour,
        totalRentals: hourCounts.get(hour) || 0,
      };
    });

    return fullDay;
  }

  async getTodayRentalPerHour() {
    const now = new Date();
    return await this.getRentalPerHourByDate(now.toString());
  }

  async getByIds(ids: string[]) {
    return await prismaRental.rental.findMany({
      where: {
        id: {
          in: ids,
        },
      },
    });
  }
}
