import { Injectable, Inject } from '@nestjs/common';
import {
  BaseService,
  CreateStationDto,
  prismaFleet,
  StationModel,
  StationStatus,
  UpdateStationDto,
  BikeStatus,
  throwGrpcError,
  STATION_MESSAGES,
  buildSearchFilter,
  GetStationDto,
  REDIS_CONSTANTS,
  REDIS_KEY_PREFIX,
} from '@mebike/common';
import Redis from 'ioredis';

@Injectable()
export class StationService extends BaseService<
  StationModel,
  CreateStationDto,
  UpdateStationDto
> {
  constructor(
    @Inject(REDIS_CONSTANTS.REDIS_CLIENT)
    private readonly redisClient: Redis,
  ) {
    super(prismaFleet.station);
  }

  async getStationStats() {
    const [activeStation, inactiveStation] = await Promise.all([
      prismaFleet.station.count({
        where: {
          status: StationStatus.Active,
        },
      }),
      prismaFleet.station.count({
        where: {
          status: StationStatus.Inactive,
        },
      }),
    ]);
    return {
      activeStation,
      inactiveStation,
    };
  }

  async getStationDetail(id: string) {
    const result = await prismaFleet.station.findUnique({
      where: { id },
      include: {
        bikes: {
          include: {
            supplier: true,
          },
        },
        _count: {
          select: {
            bikes: true,
          },
        },
      },
    });
    if (!result) {
      throwGrpcError(404, STATION_MESSAGES.NOT_FOUND, [
        STATION_MESSAGES.NOT_FOUND,
      ]);
    }

    const [
      availableBike,
      bookedBike,
      brokenBike,
      reservedBike,
      maintanedBike,
      unavailable,
    ] = await Promise.all([
      prismaFleet.bike.count({
        where: {
          stationId: result.id,
          status: BikeStatus.Available,
        },
      }),
      prismaFleet.bike.count({
        where: {
          stationId: result.id,
          status: BikeStatus.Booked,
        },
      }),
      prismaFleet.bike.count({
        where: {
          stationId: result.id,
          status: BikeStatus.Broken,
        },
      }),
      prismaFleet.bike.count({
        where: {
          stationId: result.id,
          status: BikeStatus.Reserved,
        },
      }),
      prismaFleet.bike.count({
        where: {
          stationId: result.id,
          status: BikeStatus.Maintained,
        },
      }),
      prismaFleet.bike.count({
        where: {
          stationId: result.id,
          status: BikeStatus.Unavailable,
        },
      }),
    ]);

    const stationWithCounts = {
      ...result,
      totalBike: result._count.bikes,
      availableBike,
      bookedBike,
      brokenBike,
      reservedBike,
      maintanedBike,
      unavailable,
      _count: undefined,
    };

    return stationWithCounts as unknown as StationModel;
  }

  async getAllStations(data: GetStationDto) {
    const { page, limit, longitude, latitude, search } = data;
    const searchFields = ['name', 'address', 'id'];
    const searchFilter = buildSearchFilter(search, searchFields);

    const stats = await this.getStationStats();

    if (!longitude || !latitude) {
      const [stations, total] = await Promise.all([
        prismaFleet.station.findMany({
          where: searchFilter,
          skip: (page - 1) * limit,
          take: limit,
          include: {
            _count: {
              select: {
                bikes: true,
              },
            },
          },
        }),
        prismaFleet.station.count({ where: searchFilter }),
      ]);

      const stationsWithCount = await Promise.all(
        stations.map(async (station) => {
          const [
            availableBike,
            bookedBike,
            brokenBike,
            reservedBike,
            maintanedBike,
            unavailable,
          ] = await Promise.all([
            prismaFleet.bike.count({
              where: {
                stationId: station.id,
                status: BikeStatus.Available,
              },
            }),
            prismaFleet.bike.count({
              where: {
                stationId: station.id,
                status: BikeStatus.Booked,
              },
            }),
            prismaFleet.bike.count({
              where: {
                stationId: station.id,
                status: BikeStatus.Broken,
              },
            }),
            prismaFleet.bike.count({
              where: {
                stationId: station.id,
                status: BikeStatus.Reserved,
              },
            }),
            prismaFleet.bike.count({
              where: {
                stationId: station.id,
                status: BikeStatus.Maintained,
              },
            }),
            prismaFleet.bike.count({
              where: {
                stationId: station.id,
                status: BikeStatus.Unavailable,
              },
            }),
          ]);

          return {
            ...station,
            totalBike: station._count.bikes,
            availableBike,
            bookedBike,
            brokenBike,
            reservedBike,
            maintanedBike,
            unavailable,
            _count: undefined,
          };
        }),
      );

      return {
        data: stationsWithCount,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        stats,
      };
    }

    // return dạng [[id, distance], [stationId, distance], ...]
    const geoResult = (await this.redisClient.georadius(
      REDIS_KEY_PREFIX.STATION,
      longitude,
      latitude,
      500,
      'km',
      'WITHDIST',
      'ASC',
    )) as [string, string][];

    if (!geoResult.length) {
      return {
        data: [],
        limit: limit,
        page: page,
        total: 0,
        totalPages: 0,
        stats,
      };
    }

    const stationIds = geoResult.map((item) => item[0]);
    const stations = await prismaFleet.station.findMany({
      where: {
        id: { in: stationIds },
      },
      include: {
        _count: {
          select: {
            bikes: true,
          },
        },
      },
    });

    let stationsWithCount = await Promise.all(
      stations.map(async (station) => {
        const [
          availableBike,
          bookedBike,
          brokenBike,
          reservedBike,
          maintanedBike,
          unavailable,
        ] = await Promise.all([
          prismaFleet.bike.count({
            where: {
              stationId: station.id,
              status: BikeStatus.Available,
            },
          }),
          prismaFleet.bike.count({
            where: {
              stationId: station.id,
              status: BikeStatus.Booked,
            },
          }),
          prismaFleet.bike.count({
            where: {
              stationId: station.id,
              status: BikeStatus.Broken,
            },
          }),
          prismaFleet.bike.count({
            where: {
              stationId: station.id,
              status: BikeStatus.Reserved,
            },
          }),
          prismaFleet.bike.count({
            where: {
              stationId: station.id,
              status: BikeStatus.Maintained,
            },
          }),
          prismaFleet.bike.count({
            where: {
              stationId: station.id,
              status: BikeStatus.Unavailable,
            },
          }),
        ]);

        return {
          ...station,
          totalBike: station._count.bikes,
          availableBike,
          bookedBike,
          brokenBike,
          reservedBike,
          maintanedBike,
          unavailable,
          _count: undefined,
        };
      }),
    );

    if (data.search) {
      const keyword = data.search.toLowerCase();
      stationsWithCount = stationsWithCount.filter((s: any) => {
        return (
          s.name.toLowerCase().includes(keyword) ||
          s.address.toLowerCase().includes(keyword)
        );
      });

      if (!stationsWithCount.length) {
        return {
          data: [],
          limit: limit,
          page: page,
          total: 0,
          totalPages: 0,
          stats,
        };
      }
    }

    const stationMap = new Map(
      stationsWithCount.map((station: any) => [station.id, station]),
    );

    // ghép station info vào cái mảng paginated redis trả ra dạng [id, distance]
    const result = geoResult
      .map((item) => {
        const id = item[0];
        const distance = Number.parseFloat(item[1]);
        const station = stationMap.get(id);

        if (!station) {
          return null;
        }

        return {
          ...station,
          distance,
        };
      })
      .filter((item) => item !== null);

    const total = result.length;
    const paginatedResult = result.slice((page - 1) * limit, page * limit);

    return {
      data: paginatedResult,
      limit: limit,
      page: page,
      total: total,
      totalPages: Math.ceil(total / limit),
      stats,
    };
  }

  async updateStationStatus(id: string, status: StationStatus) {
    const station = await prismaFleet.station.update({
      where: { id },
      data: { status },
    });
    return station;
  }

  async getStationsByIds(ids: string[]) {
    const stations = await prismaFleet.station.findMany({
      where: { id: { in: ids } },
    });
    return stations;
  }
}
