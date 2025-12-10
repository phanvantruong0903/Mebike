import { Controller } from '@nestjs/common';
import { RentalService } from './rental.service';
import { GrpcMethod } from '@nestjs/microservices';
import { GRPC_SERVICES } from '@mebike/common';

@Controller()
export class RentalController {
  constructor(private readonly rentalService: RentalService) {}

  @GrpcMethod(GRPC_SERVICES.RENTAL, 'Ping')
  ping() {
    return { message: 'Pong' };
  }
}
