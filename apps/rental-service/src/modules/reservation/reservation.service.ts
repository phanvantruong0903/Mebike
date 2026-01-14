import {
  ActivateReservationDto,
  BaseService,
  Bike,
  BIKE_MESSAGES,
  BikeResponse,
  BikeStatus,
  CreateRentalDto,
  CreateReservationDto,
  GRPC_PACKAGE,
  GRPC_SERVICES,
  prismaRental,
  RENTAL_MESSAGES,
  RentalStatus,
  RESERVATION_MESSAGES,
  ReservationModel,
  ReservationStatus,
  SERVER_MESSAGE,
  throwGrpcError,
} from '@mebike/common';
import { Inject, Injectable } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom, Observable } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';

interface CreateRentalFromReservation extends CreateRentalDto {
  reservationId: string;
  startStationId: string;
}

interface FleetServiceClient {
  GetBike(data: { id: string }): Observable<BikeResponse>;
  ChangeBikeStatus(data: {
    id: string;
    status: BikeStatus;
  }): Observable<BikeResponse>;
}

@Injectable()
export class ReservationService extends BaseService<
  ReservationModel,
  CreateReservationDto
> {
  private fleetService!: FleetServiceClient;
  constructor(@Inject(GRPC_PACKAGE.FLEET) private readonly client: ClientGrpc) {
    super(prismaRental.reservation);
    try {
      this.fleetService = this.client.getService<FleetServiceClient>(
        GRPC_SERVICES.FLEET,
      );
    } catch (error: any) {
      throwGrpcError(500, SERVER_MESSAGE.INTERNAL_SERVER, [
        `Failed to load ${GRPC_SERVICES.FLEET}: ${error.message}`,
      ]);
    }
  }

  override async create(data: CreateReservationDto): Promise<ReservationModel> {
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

    const prepaid = Number(process.env.PREPAID_AMOUNT || '2000');
    const endTime = this.generateEndTime(data.startTime);

    const reservationId = uuidv4();
    const stationId = bike.station?.id as string;

    const createRentalData: CreateRentalFromReservation = {
      accountId: data.accountId,
      bikeId: data.bikeId,
      subscriptionId: data.subscriptionId,
      startStationId: stationId,
      reservationId,
    };
    const [[createdReservation]] = await Promise.all([
      prismaRental.$transaction([
        prismaRental.reservation.create({
          data: {
            ...data,
            stationId,
            endTime,
            prepaid,
            id: reservationId,
          },
        }),
        prismaRental.rental.create({
          data: createRentalData,
        }),
      ]),
      this.fleetService.ChangeBikeStatus({
        id: data.bikeId,
        status: BikeStatus.Reserved,
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

    const [[activatedReservation]] = await Promise.all([
      prismaRental.$transaction([
        prismaRental.reservation.update({
          where: { id: data.id },
          data: { status: ReservationStatus.Completed },
        }),
        prismaRental.rental.update({
          where: { reservationId: reservation.id },
          data: { status: RentalStatus.Rented },
        }),
      ]),
      this.fleetService.ChangeBikeStatus({
        id: reservation.bikeId,
        status: BikeStatus.Booked,
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

  // bike functions
  async getBikeById(id: string) {
    return await firstValueFrom(this.fleetService.GetBike({ id }));
  }

  async changeBikeStatus(id: string, status: BikeStatus) {
    return await firstValueFrom(
      this.fleetService.ChangeBikeStatus({ id, status }),
    );
  }
}
