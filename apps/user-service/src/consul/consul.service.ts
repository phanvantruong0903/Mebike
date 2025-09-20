import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import Consul from 'consul';

@Injectable()
export class ConsulService implements OnModuleInit, OnModuleDestroy {
  private consul: any;
  private readonly serviceId = 'user-service';

  onModuleInit() {
    this.consul = new Consul({
      host: '127.0.0.1',
      port: 8500,
      promisify: true,
    } as any);

    this.registerService();
  }

  private async registerService() {
    try {
      await this.consul.agent.service.register({
        id: this.serviceId,
        name: 'user-service',
        address: '127.0.0.1',
        port: 50051,
        check: {
          grpc: '127.0.0.1:50051',
          grpc_use_tls: false,
          interval: '10s',
        },
      });
    } catch (err) {
      console.error('Failed to register service with Consul:', err);
    }
  }

  onModuleDestroy() {
    this.consul.agent.service.deregister(this.serviceId, (err: unknown) => {
      const error = err as Error;
      if (error) {
        console.error('Deregister failed:', error);
      } else {
        console.log('User service deregistered from Consul');
      }
    });
  }
}
