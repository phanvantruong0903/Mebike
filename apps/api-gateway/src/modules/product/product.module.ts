import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'node:path';
import { ProductService } from './product.service';
import {
  ConsuleModule,
  ConsulService,
  CONSULT_SERVICE_ID,
  GRPC_PACKAGE,
} from '@loginex/common';
import { ProductResolver } from './product.resolver';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConsuleModule,
    ConfigModule.forRoot({ isGlobal: true }),
    ClientsModule.registerAsync([
      {
        name: GRPC_PACKAGE.INVENTORY,
        imports: [ConsuleModule],
        inject: [ConsulService],
        useFactory: async (consulService: ConsulService) => {
          const productService = await consulService.discoverService(
            CONSULT_SERVICE_ID.INVENTORY,
          );
          return {
            transport: Transport.GRPC,
            options: {
              package: 'inventory',
              protoPath: join(
                process.cwd(),
                'common/src/lib/proto/product.proto',
              ),
              url: `${productService.address}:${productService.port}`,
            },
          };
        },
      },
    ]),
  ],
  providers: [ProductService, ProductResolver],
})
export class ProductModule {}
