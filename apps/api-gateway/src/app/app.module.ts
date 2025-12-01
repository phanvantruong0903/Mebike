import { Module } from '@nestjs/common';
import { AuthModule } from '../modules/auth/auth.module';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import {
  ApolloServerPluginLandingPageDisabled,
  ApolloServerPluginLandingPageLocalDefault,
} from 'apollo-server-core';
import { UserModule } from '../modules/user/user.module';
import { ProductModule } from '../modules/product/product.module';
import { WarehouseModule } from '../modules/warehouse/warehouse.module';
import { StockModule } from '../modules/stock/stock.module';
import { BinModule } from '../modules/bin/bin.module';
import { ZoneModule } from '../modules/zone/zone.module';
import { RackModule } from '../modules/rack/rack.module';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: true,
      playground: false,
      introspection: true,
      csrfPrevention: false,
      plugins: [
        process.env.NODE_ENV === 'production'
          ? (ApolloServerPluginLandingPageDisabled() as any)
          : ApolloServerPluginLandingPageLocalDefault({
              embed: true,
              includeCookies: true,
            }),
      ],
    }),
    AuthModule,
    UserModule,
    ProductModule,
    ProductModule,
    WarehouseModule,
    StockModule,
    BinModule,
    ZoneModule,
    RackModule,
  ],
})
export class AppModule {}
