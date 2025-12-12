import {
  BikeStatus,
  CreateRentalDto,
  EndRentalDto,
  prismaFleet,
  prismaRental,
  RENTAL_MESSAGES,
  RentalModel,
  RentalStatus,
} from '@mebike/common';
import { Injectable } from '@nestjs/common';

@Injectable()
export class RentalService {
  async create(data: CreateRentalDto): Promise<RentalModel> {
    const bike = await prismaFleet.bike.findUnique({
      where: { id: data.bikeId },
    });
    if (!bike) {
      throw new Error('Bike not found');
    }

    return await prismaRental.rental.create({
      data: {
        ...data,
        userId: data.accountId,
        startStation: bike.stationId,
      },
    });
  }

  async end(data: EndRentalDto): Promise<RentalModel> {
    const rental = await prismaRental.rental.findUnique({
      where: { id: data.id, status: RentalStatus.Rented },
    });
    if (!rental) {
      throw new Error(
        RENTAL_MESSAGES.NOT_FOUND_WITH_STATUS(RentalStatus.Rented),
      );
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
          endStation: rental.startStation,
          endTime: now,
          duration: duration,
          totalPrice: totalPrice,
          status: RentalStatus.Completed,
        },
      }),
      prismaFleet.bike.update({
        where: { id: rental.bikeId },
        data: {
          status: BikeStatus.Available,
        },
      }),
    ]);
    return updatedRental;
  }

  generateDuration(start: Date, end: Date) {
    return Math.ceil((end.getTime() - start.getTime()) / 60000);
  }

  generateTotalPrice(minutes: number) {
    const halfHourUnit = Math.max(1, Math.ceil(minutes / 30));
    const pricePer30Min = Number(process.env.PRICE_PER_30_MINS || '2000');
    return pricePer30Min * halfHourUnit;
  }
}
