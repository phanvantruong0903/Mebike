import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConsulService, CONSULT_SERVICE_ID } from '@mebike/common';

@Injectable()
export class AuthConsulRegistrar implements OnModuleInit, OnModuleDestroy {
  constructor(private readonly consulService: ConsulService) {}

  async onModuleInit() {
    await this.consulService.registerService(
      CONSULT_SERVICE_ID.AUTH,
      CONSULT_SERVICE_ID.AUTH,
      this.consulService.getLocalIp(),
      Number(process.env.USER_SERVICE_PORT) || 50051
    );
  }

  async onModuleDestroy() {
    await this.consulService.deregisterService(CONSULT_SERVICE_ID.AUTH);
  }
}
