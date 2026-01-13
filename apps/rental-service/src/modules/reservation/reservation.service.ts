import {
  ActivateReservationDto,
  BaseService,
  CreateRentalDto,
  CreateReservationDto,
  prismaRental,
  RENTAL_MESSAGES,
  RentalStatus,
  RESERVATION_MESSAGES,
  ReservationModel,
  ReservationStatus,
  SERVER_MESSAGE,
  throwGrpcError,
} from '@mebike/common';
import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

interface CreateRentalFromReservation extends CreateRentalDto {
  reservationId: string;
  startStationId: string;
}

@Injectable()
export class ReservationService extends BaseService<
  ReservationModel,
  CreateReservationDto
> {
  constructor() {
    super(prismaRental.reservation);
  }

  override async create(data: CreateReservationDto): Promise<ReservationModel> {
    const prepaid = Number(process.env.PREPAID_AMOUNT || '2000');
    const endTime = this.generateEndTime(data.startTime);

    const reservationId = uuidv4();

    const createRentalData: CreateRentalFromReservation = {
      accountId: data.accountId,
      bikeId: data.bikeId,
      subscriptionId: data.subscriptionId,
      startStationId: data.stationId,
      reservationId,
    };
    const [createdReservation] = await prismaRental.$transaction([
      prismaRental.reservation.create({
        data: {
          ...data,
          endTime,
          prepaid,
          id: reservationId,
        },
      }),
      prismaRental.rental.create({
        data: createRentalData,
      }),
    ]);

    return createdReservation;
  }

  async activate(data: ActivateReservationDto): Promise<ReservationModel> {
    const reservation = await prismaRental.reservation.findUnique({
      where: { id: data.id, status: ReservationStatus.Pending },
    });
    if (!reservation) {
      throwGrpcError(404, SERVER_MESSAGE.NOT_FOUND, [
        RESERVATION_MESSAGES.NOT_FOUND_WITH_STATUS(ReservationStatus.Pending),
      ]);
    }

    if (!reservation.bikeId) {
      throwGrpcError(400, SERVER_MESSAGE.BAD_REQUEST, [
        RENTAL_MESSAGES.BIKE_NOT_ASSIGNED,
      ]);
    }

    const now = new Date();
    if (now < reservation.startTime || now > reservation.endTime) {
      throwGrpcError(400, SERVER_MESSAGE.BAD_REQUEST, [
        RESERVATION_MESSAGES.INVALID_ACTIVATE_TIME,
      ]);
    }

    const [activatedReservation] = await prismaRental.$transaction([
      prismaRental.reservation.update({
        where: { id: data.id },
        data: { status: ReservationStatus.Completed },
      }),
      prismaRental.rental.update({
        where: { reservationId: reservation.id },
        data: { status: RentalStatus.Rented },
      }),
    ]);

    return activatedReservation;
  }

  async getOne(id: string): Promise<ReservationModel | null> {
    const reservation = await prismaRental.reservation.findUnique({
      where: { id },
    });
    return reservation;
  }

  generateEndTime(startTime: string) {
    const validConfirmHour = Number(process.env.VALID_CONFIRM_HOUR || '1');
    const endTime = new Date(startTime);
    endTime.setHours(endTime.getHours() + validConfirmHour);
    return endTime;
  }
}
