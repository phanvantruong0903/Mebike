import { Module } from '@nestjs/common';
import { AuthModule } from '../modules/auth/auth.module';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { formatError } from '../config/graphql.config';
import { ApolloServerPluginLandingPageDisabled } from '@apollo/server/plugin/disabled';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { UserModule } from '../modules/user/user.module';
import { SupplierModule } from '../modules/supplier/supplier.module';
import { StationModule } from '../modules/station/station.module';
import { BikeModule } from '../modules/bike/bike.module';
import { PaymentModule } from '../modules/payment/payment.module';
import { WalletModule } from '../modules/wallet/wallet.module';
import { HttpErrorStatusPlugin } from '../plugins/http-status.plugin';
import { RentalModule } from '../modules/rental/rental.module';
import { ReservationModule } from '../modules/reservation/reservation.module';

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
      formatError,
    }),
    AuthModule,
    UserModule,
    SupplierModule,
    StationModule,
    BikeModule,
    PaymentModule,
    WalletModule,
    RentalModule,
    ReservationModule,
  ],
  providers: [HttpErrorStatusPlugin],
})
export class AppModule {}
