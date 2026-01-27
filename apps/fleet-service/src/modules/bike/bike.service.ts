import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import {
  BaseService,
  BikeModel,
  CreateBikeDto,
  UpdateBikeDto,
  prismaFleet,
  throwGrpcError,
  BIKE_MESSAGES,
  STATION_MESSAGES,
  BikeStatus,
  meiliClient,
  REDIS_CONSTANTS,
  GetBikeDto,
} from '@mebike/common';
import Redis from 'ioredis';
import { createCache } from 'async-cache-dedupe';
import * as SqlString from 'sqlstring';

@Injectable()
export class BikeService
  extends BaseService<BikeModel, CreateBikeDto, UpdateBikeDto>
  implements OnModuleInit
{
  private readonly requestDedup;

  constructor(
    @Inject(REDIS_CONSTANTS.REDIS_CLIENT) private readonly redisClient: Redis,
  ) {
    super(prismaFleet.bike);
    this.requestDedup = createCache({
      ttl: 5,
      storage: {
        type: 'memory',
      },
    });

    this.requestDedup.define('fetchBikeById', {}, async (id: string) => {
      const key = `bike:${id}`;

      const cachedBike = await this.redisClient.get(key);
      if (cachedBike) return JSON.parse(cachedBike);

      const bike = await prismaFleet.bike.findUnique({
        where: { id },
        include: {
          station: true,
          supplier: true,
        },
      });
      if (bike) {
        await this.cacheBikeToRedis(bike, 3600);
      }
      return bike;
    });
  }

  async onModuleInit() {
    await this.createBikeIndex();
  }

  async createBikeIndex() {
    try {
      await meiliClient.getIndex('Bike');
    } catch {
      await meiliClient.createIndex('Bike', { primaryKey: 'id' });
    }
    await meiliClient.index('Bike').updateSettings({
      searchableAttributes: ['chipId', 'id'],
      filterableAttributes: ['status', 'supplierId', 'stationId'],
      sortableAttributes: ['createdAt'],
    });
  }

  async cacheBikeToRedis(bike: BikeModel, ttlSecond: number) {
    const key = `bike:${bike.id}`;
    await this.redisClient.set(key, JSON.stringify(bike), 'EX', ttlSecond);
  }

  async getBikeDetail(id: string) {
    const bike = await (this.requestDedup as any).fetchBikeById(id);

    if (!bike) {
      throwGrpcError(404, BIKE_MESSAGES.NOT_FOUND, [BIKE_MESSAGES.NOT_FOUND]);
    }

    return bike as unknown as BikeModel;
  }

  async createBike(data: CreateBikeDto) {
    const findStation = await prismaFleet.station.findUnique({
      where: { id: data.stationId },
      include: {
        _count: {
          select: { bikes: true },
        },
      },
    });

    if (!findStation) {
      throwGrpcError(404, STATION_MESSAGES.NOT_FOUND, [
        STATION_MESSAGES.NOT_FOUND,
      ]);
    }

    const currentBikeCount = findStation._count.bikes;
    if (currentBikeCount >= findStation.capacity) {
      throwGrpcError(400, STATION_MESSAGES.STATION_FULL, [
        STATION_MESSAGES.STATION_FULL,
      ]);
    }

    const result = await this.create(data);

    const bikeData = await prismaFleet.bike.findUnique({
      where: { id: result.id },
      include: { station: true, supplier: true },
    });

    if (bikeData) {
      await this.cacheBikeToRedis(bikeData, 3600);
    }
    return bikeData as unknown as BikeModel;
  }

  async changeBikeStatus(id: string, status: BikeStatus) {
    const bikeData = await prismaFleet.bike.update({
      where: { id },
      data: { status },
      include: { station: true, supplier: true },
    });

    if (bikeData) {
      await this.cacheBikeToRedis(bikeData, 3600);
    }

    return bikeData;
  }

  async getBikesByIds(ids: string[]) {
    const bikes = await prismaFleet.bike.findMany({
      where: { id: { in: ids } },
    });
    return bikes;
  }

  async getAllBikes(data: GetBikeDto) {
    const { page = 1, limit = 10, status, stationId, supplierId } = data;

    const filter: string[] = [];
    if (status) filter.push(`status = "${SqlString.escape(status)}"`);
    if (stationId) filter.push(`stationId = "${SqlString.escape(stationId)}"`);
    if (supplierId)
      filter.push(`supplierId = "${SqlString.escape(supplierId)}"`);

    const result = await meiliClient.index('Bike').search('', {
      ...(filter.length ? { filter: filter.join(' AND ') } : {}),
      limit,
      offset: (page - 1) * limit,
      sort: ['createdAt:desc'],
      attributesToRetrieve: ['id'],
    });

    const bikeIds = result.hits.map((hit) => hit.id);
    if (bikeIds.length === 0) {
      return {
        data: [],
        total: result.estimatedTotalHits,
        page,
        limit,
        totalPages: 0,
      };
    }

    const bikes = await Promise.all(
      bikeIds.map((id) => (this.requestDedup as any).fetchBikeById(id)),
    );

    const bikeMap = new Map(
      bikes.filter((bike) => bike !== null).map((bike) => [bike.id, bike]),
    );

    const response = bikeIds
      .map((bikeId) => bikeMap.get(bikeId))
      .filter((bike) => bike !== null);

    return {
      data: response,
      total: result.estimatedTotalHits,
      page,
      limit,
      totalPages: Math.ceil(result.estimatedTotalHits / limit),
    };
  }
}
