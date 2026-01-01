import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';

@Controller()
export class HealthController {
  @GrpcMethod('Health', 'Check')
  check() {
    return { status: 'SERVING' };
  }
}
