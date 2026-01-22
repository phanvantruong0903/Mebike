import { Injectable } from '@nestjs/common';
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
  addDocument,
  updateDocument,
} from '@mebike/common';

@Injectable()
export class BikeService extends BaseService<
  BikeModel,
  CreateBikeDto,
  UpdateBikeDto
> {
  constructor() {
    super(prismaFleet.bike);
  }

  async getBikeDetail(id: string) {
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

    const result = await prismaFleet.bike.create({
      data,
      include: {
        station: true,
        supplier: true,
      },
    });

    await addDocument('Bike', result);
    return result as unknown as BikeModel;
  }

  async update(id: string, data: UpdateBikeDto): Promise<BikeModel> {
    const result = await prismaFleet.bike.update({
      where: { id },
      data,
      include: {
        station: true,
        supplier: true,
      },
    });
    await updateDocument('Bike', result);
    return result as unknown as BikeModel;
  }

  async changeBikeStatus(id: string, status: BikeStatus) {
    try {
      const profile = await prismaFleet.bike.update({
        where: { id },
        data: { status },
        include: {
          station: true,
          supplier: true,
        },
      });
      await updateDocument('Bike', profile);
      return profile;
    } catch (error: any) {
      if (error.code === 'P2025') {
        throwGrpcError(404, BIKE_MESSAGES.NOT_FOUND, [BIKE_MESSAGES.NOT_FOUND]);
      }
      throw error;
    }
  }

  async getBikesByIds(ids: string[]) {
    const bikes = await prismaFleet.bike.findMany({
      where: { id: { in: ids } },
    });
    return bikes;
  }
}
