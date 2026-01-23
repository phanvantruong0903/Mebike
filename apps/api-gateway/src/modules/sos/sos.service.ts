import {
  ForbiddenException,
  Inject,
  Injectable,
  OnModuleInit,
} from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { Observable, firstValueFrom } from 'rxjs';
import {
  GRPC_PACKAGE,
  GRPC_SERVICES,
  SosResponse,
  UpdateSosDto,
  SosListResponse,
  UserProfile,
  Role,
  Sos,
  SOS_MESSAGES,
  GetSosDto,
  CreateSosDto,
} from '@mebike/common';

interface SosServiceClient {
  GetSos(data: { id: string }): Observable<SosResponse>;
  UpdateSosStatus(data: UpdateSosDto): Observable<SosResponse>;
  GetAllSos(data: GetSosDto): Observable<SosListResponse>;
  CreateSos(data: CreateSosDto): Observable<SosResponse>;
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

  async createSos(data: CreateSosDto) {
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
      throw new ForbiddenException(SOS_MESSAGES.FORBIDDEN);
    }
    if (user.role === Role.SOS && sos.agentId !== user.accountId) {
      throw new ForbiddenException(SOS_MESSAGES.FORBIDDEN);
    }
    return response;
  }
}
