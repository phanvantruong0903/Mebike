import {
  BikeResponse,
  ChangeBikeStatusDto,
  CreateSosDto,
  GRPC_PACKAGE,
  GRPC_SERVICES,
} from '@mebike/common';
import { Inject, Injectable } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { lastValueFrom, Observable } from 'rxjs';
import { SosService } from '../modules/sos/sos.service';

interface FleetServiceClient {
  ChangeBikeStatus(input: ChangeBikeStatusDto): Observable<BikeResponse>;
}

@Injectable()
export class SosCreationActivity {
  private readonly fleetService: FleetServiceClient;

  constructor(
    @Inject(GRPC_PACKAGE.FLEET) private readonly client: ClientGrpc,
    private readonly sosService: SosService,
  ) {
    this.fleetService = this.client.getService<FleetServiceClient>(
      GRPC_SERVICES.FLEET,
    );
  }

  async changeBikeStatus(data: ChangeBikeStatusDto) {
    const response = await lastValueFrom(
      this.fleetService.ChangeBikeStatus(data),
    );
    if (!response.success) {
      throw new Error(response.message);
    }
  }

  async createSos(data: CreateSosDto) {
    try {
      const response = await this.sosService.createSos(data);
      if (!response.id) {
        throw new Error('Failed to create Sos');
      }

      return response;
    } catch (error: any) {
      const errorObj = error?.error || error;

      throw new Error(JSON.stringify(errorObj));
    }
  }

  async deleteSos(data: { id: string }) {
    console.log('[COMPENSATION] Attempting to delete sos:', data);
    try {
      const response = await this.sosService.deleteSos(data.id);
      if (!response) {
        console.warn('[COMPENSATION] Delete sos failed:', data);
      } else {
        console.log('[COMPENSATION] Delete sos success:', data);
      }
    } catch (error: any) {
      console.error('[COMPENSATION] Delete sos error:', error?.message);
    }
  }
}
