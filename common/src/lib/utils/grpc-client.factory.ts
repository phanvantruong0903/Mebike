import { Transport, GrpcOptions } from '@nestjs/microservices';
import { join } from 'node:path';
import { ConsulModule, ConsulService } from '../consul';

export const createGrpcClient = (
  name: string,
  serviceId: string,
  packageName: string,
  protoFileName: string,
) => ({
  name,
  imports: [ConsulModule],
  inject: [ConsulService],
  useFactory: async (consulService: ConsulService) => {
    const service = await consulService.discoverService(serviceId);
    return {
      transport: Transport.GRPC,
      options: {
        package: packageName,
        protoPath: join(process.cwd(), `common/src/lib/proto/${protoFileName}`),
        url: `${service.address}:${service.port}`,
        channelOptions: {
          'grpc.max_reconnect_backoff_ms': 5000,
          'grpc.initial_reconnect_backoff_ms': 1000,
        },
        maxRetryAttempts: 5,
        retryDelay: 3000,
      },
    } as GrpcOptions;
  },
});
