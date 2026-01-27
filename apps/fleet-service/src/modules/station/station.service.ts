import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
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
  GetStationDto,
  REDIS_CONSTANTS,
  REDIS_KEY_PREFIX,
  meiliClient,
} from '@mebike/common';
import Redis from 'ioredis';
import { createCache } from 'async-cache-dedupe';
import * as SqlString from 'sqlstring';

@Injectable()
export class StationService
  extends BaseService<StationModel, CreateStationDto, UpdateStationDto>
  implements OnModuleInit
{
  private readonly requestDedup;

  constructor(
    @Inject(REDIS_CONSTANTS.REDIS_CLIENT)
    private readonly redisClient: Redis,
  ) {
    super(prismaFleet.station);
    this.requestDedup = createCache({
      ttl: 5,
      storage: {
        type: 'memory',
      },
    });
    this.requestDedup.define('fetchStationById', {}, async (id: string) => {
      const key = `station:${id}`;

      const cacheStation = await this.redisClient.get(key);
      if (cacheStation) return JSON.parse(cacheStation);

      const station = await prismaFleet.station.findUnique({
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

      if (station) await this.cacheStationToRedis(station, 3600);
      return station;
    });
  }

  async onModuleInit() {
    await this.createStationIndex();
  }

  async cacheStationToRedis(station: StationModel, ttlSecond: number) {
    const key = `station:${station.id}`;
    await this.redisClient.set(key, JSON.stringify(station), 'EX', ttlSecond);
  }

  async createStationIndex() {
    try {
      await meiliClient.getIndex('Station');
    } catch {
      await meiliClient.createIndex('Station', { primaryKey: 'id' });
    }
    await meiliClient.index('Station').updateSettings({
      searchableAttributes: ['name', 'address', 'id'],
      filterableAttributes: ['status', 'id'],
      sortableAttributes: ['createdAt'],
    });
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
    const result = await (this.requestDedup as any).fetchStationById(id);
    if (!result) {
      throwGrpcError(404, STATION_MESSAGES.NOT_FOUND, [
        STATION_MESSAGES.NOT_FOUND,
      ]);
    }

    const searchStation = await meiliClient.index('Bike').search('', {
      filter: `stationId = "${result.id}"`,
      facets: ['status'],
      limit: 0,
    });

    const stationStats = searchStation.facetDistribution?.status || {};

    const stationWithCounts = {
      ...result,
      totalBike: result._count.bikes,
      availableBike: stationStats[BikeStatus.Available] || 0,
      bookedBike: stationStats[BikeStatus.Booked] || 0,
      brokenBike: stationStats[BikeStatus.Broken] || 0,
      reservedBike: stationStats[BikeStatus.Reserved] || 0,
      maintanedBike: stationStats[BikeStatus.Maintained] || 0,
      unavailable: stationStats[BikeStatus.Unavailable] || 0,
      _count: undefined,
    };

    return stationWithCounts as unknown as StationModel;
  }

  async getAllStations(data: GetStationDto) {
    const { page, limit, longitude, latitude, status } = data;
    const filter: string[] = [];
    if (status) {
      filter.push(`status = "${SqlString.escape(status)}"`);
    }

    const stats = await this.getStationStats();

    if (!longitude || !latitude) {
      const stationSearch = await meiliClient.index('Station').search('', {
        ...(filter.length ? { filter: filter.join(' AND ') } : {}),
        limit,
        offset: ((page ?? 1) - 1) * (limit ?? 10),
        sort: ['createdAt:desc'],
        attributesToRetrieve: ['id'],
      });
      const total = stationSearch.estimatedTotalHits;

      const searchQueries = stationSearch.hits.map((station) => ({
        indexUid: 'Bike',
        q: '',
        filter: `stationId = "${station.id}"`, // sql string chỉ cho search filter
        facets: ['status'],
        limit: 0,
      }));

      const { results } = await meiliClient.multiSearch({
        queries: searchQueries,
      });

      const stationIds = stationSearch.hits.map((s) => s.id);
      const stations = await Promise.all(
        stationIds.map((id) => (this.requestDedup as any).fetchStationById(id)),
      );
      const stationMap = new Map(
        stations.filter((s) => s !== null).map((s) => [s.id, s]),
      );

      const stationsWithCount = results
        .map((stationResult, index) => {
          const stationId = stationIds[index];
          const station = stationMap.get(stationId);

          if (!station) return null;

          const stationStats = stationResult.facetDistribution?.status || {};
          const totalBike = stationResult.estimatedTotalHits;

          return {
            ...station,
            totalBike: totalBike || 0,
            availableBike: stationStats[BikeStatus.Available] || 0,
            bookedBike: stationStats[BikeStatus.Booked] || 0,
            brokenBike: stationStats[BikeStatus.Broken] || 0,
            reservedBike: stationStats[BikeStatus.Reserved] || 0,
            maintanedBike: stationStats[BikeStatus.Maintained] || 0,
            unavailable: stationStats[BikeStatus.Unavailable] || 0,
            _count: undefined,
          };
        })
        .filter((item) => item !== null);

      return {
        data: stationsWithCount,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / (limit ?? 10)),
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

    const allStationIds = geoResult.map((item) => item[0]);
    const stations = await Promise.all(
      allStationIds.map((id) =>
        (this.requestDedup as any).fetchStationById(id),
      ),
    );
    const stationMap = new Map(
      stations
        .filter((s) => s && (s.status === status || !status))
        .map((s) => [s.id, s]),
    );

    const filteredGeoResult = geoResult.filter(([id]) => stationMap.has(id));
    const total = filteredGeoResult.length;

    const paginatedGeo = filteredGeoResult.slice(
      ((page ?? 1) - 1) * (limit ?? 10),
      (page ?? 1) * (limit ?? 10),
    );

    if (!paginatedGeo.length) {
      return {
        data: [],
        limit: limit,
        page: page,
        total,
        totalPages: Math.ceil(total / (limit ?? 10)),
        stats,
      };
    }

    const stationIds = paginatedGeo.map((item) => item[0]);

    const searchStation = stationIds.map((stationId) => ({
      indexUid: 'Bike',
      q: '',
      filter: `stationId = "${stationId}"`,
      facets: ['status'],
      limit: 0,
    }));

    const bikeSearch = await meiliClient.multiSearch({
      queries: searchStation,
    });

    const result = paginatedGeo
      .map((item, index) => {
        const id = item[0];
        const distance = item[1];
        const station = stationMap.get(id);

        if (!station) return null;
        const searchResult = bikeSearch.results[index];
        const totalBike = searchResult.estimatedTotalHits;
        const stationStats = searchResult.facetDistribution?.status || {};

        return {
          ...station,
          distance,
          totalBike: totalBike || 0,
          availableBike: stationStats[BikeStatus.Available] || 0,
          bookedBike: stationStats[BikeStatus.Booked] || 0,
          brokenBike: stationStats[BikeStatus.Broken] || 0,
          reservedBike: stationStats[BikeStatus.Reserved] || 0,
          maintanedBike: stationStats[BikeStatus.Maintained] || 0,
          unavailable: stationStats[BikeStatus.Unavailable] || 0,
          _count: undefined,
        };
      })
      .filter((item) => item !== null);

    return {
      data: result,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / (limit ?? 10)),
      stats,
    };
  }

  async updateStationStatus(id: string, status: StationStatus) {
    const station = await prismaFleet.station.update({
      where: { id },
      data: { status },
    });

    if (station) {
      await this.cacheStationToRedis(station, 3600);
    }

    return station;
  }

  async getStationsByIds(ids: string[], status?: StationStatus) {
    const where: any = { id: { in: ids } };
    if (status) {
      where.status = status;
    }

    const stations = await prismaFleet.station.findMany({
      where,
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
    return stations;
  }

  async checkStationExist(id: string) {
    const station = await prismaFleet.station.findUnique({
      where: { id },
      select: { id: true },
    });
    return !!station;
  }

  async updateStation(data: UpdateStationDto) {
    const station = await prismaFleet.station.update({
      where: { id: data.id },
      data,
    });

    if (station) {
      this.cacheStationToRedis(station, 3600);
    }

    return station;
  }
}
