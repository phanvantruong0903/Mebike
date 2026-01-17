import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { Observable, firstValueFrom } from 'rxjs';
import {
  GRPC_PACKAGE,
  GRPC_SERVICES,
  CreateSosInput,
  SosResponse,
  UpdateSosDto,
  SosListResponse,
  UserProfile,
  Role,
  Sos,
  SOS_MESSAGES,
  GetSosDto,
} from '@mebike/common';
import { GraphQLError } from 'graphql/error';

interface SosServiceClient {
  GetSos(data: { id: string }): Observable<SosResponse>;
  UpdateSosStatus(data: UpdateSosDto): Observable<SosResponse>;
  GetAllSos(data: GetSosDto): Observable<SosListResponse>;
  CreateSos(data: CreateSosInput): Observable<SosResponse>;
  // GetStationsByIds(data: { ids: string[] }): Observable<{ data: Station[] }>;
  // UpdateStationStatus(
  //   data: UpdateStationStatusInput,
  // ): Observable<StationResponse>;
}

@Injectable()
export class SosService implements OnModuleInit {
  private incidentService!: SosServiceClient;

  constructor(@Inject(GRPC_PACKAGE.SOS) private readonly client: ClientGrpc) {}

  onModuleInit() {
    this.incidentService = this.client.getService<SosServiceClient>(
      GRPC_SERVICES.INCIDENT,
    );
  }

  async createSos(data: CreateSosInput) {
    return await firstValueFrom(this.incidentService.CreateSos(data));
  }

  async updateSosStatus(data: UpdateSosDto) {
    return await firstValueFrom(this.incidentService.UpdateSosStatus(data));
  }

  async getAllSos(
    data: Omit<GetSosDto, 'accountId' | 'role'>,
    user: UserProfile,
  ) {
    const accountId = user.accountId;
    const role = user.role;
    const response = await firstValueFrom(
      this.incidentService.GetAllSos({ ...data, accountId, role }),
    );
    return {
      ...response,
      data: response.data ?? [],
    };
  }

  async getSos(data: { id: string }, user: UserProfile) {
    const response = await firstValueFrom(this.incidentService.GetSos(data));
    const sos = response.data as unknown as Sos;

    if (user.role === Role.USER && user.accountId !== sos.requesterId) {
      throw new GraphQLError(SOS_MESSAGES.FORBIDDEN, {
        extensions: {
          statusCode: 403,
        },
      });
    }
    if (user.role === Role.SOS && sos.agentId !== user.accountId) {
      throw new GraphQLError(SOS_MESSAGES.FORBIDDEN, {
        extensions: {
          statusCode: 403,
        },
      });
    }
    return response;
  }
}
