import { Module } from '@nestjs/common';
import { AuthModule } from '../modules/auth/auth.module';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import {
  ApolloServerPluginLandingPageDisabled,
  ApolloServerPluginLandingPageLocalDefault,
} from 'apollo-server-core';
import { UserModule } from '../modules/user/user.module';

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
      formatError: (error: any) => {
        const graphQLFormattedError = {
          message:
            error.extensions?.exception?.response?.message ||
            error.extensions?.response?.message ||
            error.message ||
            'Internal server error',
          statusCode:
            error.extensions?.exception?.response?.statusCode ||
            error.extensions?.response?.statusCode ||
            error.extensions?.statusCode ||
            500,
          success: false,
          errors: [error.message],
        };

        if (error.message === 'Unauthorized') {
          graphQLFormattedError.statusCode = 401;
          graphQLFormattedError.message = 'Unauthorized';
        }

        if (error.message === 'Forbidden resource') {
          graphQLFormattedError.statusCode = 403;
          graphQLFormattedError.message = 'Forbidden resource';
        }

        const { statusCode } = graphQLFormattedError;

        if (statusCode === 401) {
          graphQLFormattedError.message = 'Unauthorized';
        }

        if (statusCode === 403) {
          graphQLFormattedError.message = 'Forbidden resource';
        }

        return graphQLFormattedError;
      },
    }),
    AuthModule,
    UserModule,
  ],
})
export class AppModule {}
