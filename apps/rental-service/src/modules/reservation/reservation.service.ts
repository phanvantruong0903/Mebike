import {
  BaseService,
  ConfirmReservationDto,
  CreateReservationDto,
  prismaRental,
  RENTAL_MESSAGES,
  RESERVATION_MESSAGES,
  ReservationModel,
  ReservationStatus,
} from '@mebike/common';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ReservationService extends BaseService<
  ReservationModel,
  CreateReservationDto
> {
  constructor() {
    super(prismaRental.reservation);
  }

  override async create(data: CreateReservationDto): Promise<ReservationModel> {
    const prepaid = Number(process.env.PREPAID || '2000');
    return await prismaRental.reservation.create({
      data: {
        ...data,
        prepaid,
      },
    });
  }

  async confirm(data: ConfirmReservationDto): Promise<ReservationModel> {
    const reservation = await prismaRental.reservation.findUnique({
      where: { id: data.id, status: ReservationStatus.Pending },
    });
    if (!reservation) {
      throw new Error(
        RESERVATION_MESSAGES.NOT_FOUND_WITH_STATUS(ReservationStatus.Pending),
      );
    }

    if (!reservation.bikeId) {
      throw new Error(RENTAL_MESSAGES.FIELD_NOT_FOUND('bikeId'));
    }

    return await prismaRental.reservation.update({
      where: { id: data.id },
      data: { status: ReservationStatus.Active },
    });
  }

  async getOne(id: string): Promise<ReservationModel | null> {
    const reservation = await prismaRental.reservation.findUnique({
      where: { id },
    });
    return reservation;
  }
}
