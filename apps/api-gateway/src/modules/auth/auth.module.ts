import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { GRPC_PACKAGE } from '@mebike/common';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: GRPC_PACKAGE.USER,
        transport: Transport.GRPC,
        options: {
          package: 'user',
          protoPath: join(
            process.cwd(),
            'common/src/lib/proto/user.proto'
          ),
          url: '0.0.0.0:50051',
        },
      },
    ]),
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
