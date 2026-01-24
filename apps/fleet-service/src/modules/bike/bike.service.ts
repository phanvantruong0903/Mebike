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
  KAFKA_SERVICE,
  KAFKA_TOPIC,
  GetBikeDto,
} from '@mebike/common';
import Redis from 'ioredis';
import { ClientKafka } from '@nestjs/microservices';

@Injectable()
export class BikeService
  extends BaseService<BikeModel, CreateBikeDto, UpdateBikeDto>
  implements OnModuleInit
{
  constructor(
    @Inject(REDIS_CONSTANTS.REDIS_CLIENT) private readonly redisClient: Redis,
    @Inject(KAFKA_SERVICE.FLEET_SERVICE)
    private readonly kafkaClient: ClientKafka,
  ) {
    super(prismaFleet.bike);
  }

  async onModuleInit() {
    await this.createBikeIndex();
  }

  async createBikeIndex() {
    try {
      await meiliClient.getIndex('Bike');
    } catch {
      await meiliClient.createIndex('Bike', { primaryKey: 'id' });
      await meiliClient.index('Bike').updateSettings({
        searchableAttributes: ['chipId', 'id'],
        filterableAttributes: ['status', 'supplierId', 'stationId'],
        sortableAttributes: ['createdAt'],
      });
    }
  }

  private syncCacheToRedis(bike: BikeModel, ttlSecond: number, topic: string) {
    this.kafkaClient.emit(topic, JSON.stringify({ bike, ttlSecond }));
  }

  async cacheBikeToRedis(bike: BikeModel, ttlSecond: number) {
    const key = `bike:${bike.id}`;
    await this.redisClient.set(key, JSON.stringify(bike), 'EX', ttlSecond);
  }

  async getBikeDetail(id: string) {
    const bike = await this.redisClient.get(`bike:${id}`);
    if (bike) return bike as unknown as BikeModel;

    const result = await prismaFleet.bike.findUnique({
      where: { id },
      include: {
        station: true,
        supplier: true,
      },
    });
    if (!result) {
      throwGrpcError(404, BIKE_MESSAGES.NOT_FOUND, [BIKE_MESSAGES.NOT_FOUND]);
    }

    this.syncCacheToRedis(result, 3600, KAFKA_TOPIC.BIKE_CACHE_REFRESH);
    return result as unknown as BikeModel;
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
      this.syncCacheToRedis(bikeData, 3600, KAFKA_TOPIC.BIKE_CREATED);
    }
    return bikeData as unknown as BikeModel;
  }

  async changeBikeStatus(id: string, status: BikeStatus) {
    await prismaFleet.bike.update({
      where: { id },
      data: { status },
    });

    const bikeData = await prismaFleet.bike.findUnique({
      where: { id },
      include: { station: true, supplier: true },
    });

    if (bikeData) {
      this.syncCacheToRedis(bikeData, 3600, KAFKA_TOPIC.BIKE_UPDATED);
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
    if (status) filter.push(`status = "${status}"`);
    if (stationId) filter.push(`stationId = "${stationId}"`);
    if (supplierId) filter.push(`supplierId = "${supplierId}"`);

    const result = await meiliClient.index('Bike').search('', {
      filter: filter.join(' AND '),
      limit,
      offset: (page - 1) * limit,
      sort: ['createdAt:desc'],
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

    const redisKeys = bikeIds.map((id) => `bike:${id}`);
    const bikeData = await this.redisClient.mget(redisKeys);

    const bikes: BikeModel[] = [];
    const missingIds: string[] = [];

    bikeData.forEach((bike, index) => {
      if (bike) bikes.push(JSON.parse(bike));
      else missingIds.push(bikeIds[index]);
    });

    if (missingIds.length > 0) {
      const missingBikes = await prismaFleet.bike.findMany({
        where: { id: { in: missingIds } },
        include: { station: true, supplier: true },
      });
      await Promise.all(
        missingBikes.map((bike) => {
          this.syncCacheToRedis(bike, 3600, KAFKA_TOPIC.BIKE_CACHE_REFRESH);
        }),
      );

      bikes.push(...missingBikes);
    }

    const response = bikeIds.map((bikeId) =>
      bikes.find((bike) => bike.id === bikeId),
    );
    return {
      data: response,
      total: result.estimatedTotalHits,
      page,
      limit,
      totalPages: Math.ceil(result.estimatedTotalHits / limit),
    };
  }
}
