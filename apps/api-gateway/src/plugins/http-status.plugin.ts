import { Plugin } from '@nestjs/apollo';
import {
  ApolloServerPlugin,
  GraphQLRequestListener,
} from 'apollo-server-plugin-base';

@Plugin()
export class HttpErrorStatusPlugin implements ApolloServerPlugin {
  async requestDidStart(): Promise<GraphQLRequestListener> {
    return {
      willSendResponse: async ({ response }) => {
        const errors = this.getErrors(response);

        if (errors && errors.length > 0) {
          const error = errors[0];
          const statusCode = this.getStatusCode(error);

          if (response.http) {
            if (statusCode) {
              response.http.status = statusCode;
            } else {
              this.handleFallbackStatus(response.http, error);
            }
          }
        } else {
          console.log(response);
        }
      },
    };
  }

  private getErrors(response: any): any[] | undefined {
    const responseAny = response as any;
    if (responseAny.body && responseAny.body.kind === 'single') {
      return responseAny.body.singleResult.errors;
    }
    return response.errors;
  }

  private getStatusCode(error: any): number | undefined {
    return (
      (error as any).statusCode ||
      (error.extensions?.response as any)?.statusCode ||
      (error.extensions?.exception as any)?.status ||
      (error.extensions as any)?.statusCode
    );
  }

  private handleFallbackStatus(http: any, error: any): void {
    if (
      error.message === 'Unauthorized' ||
      error.extensions?.code === 'UNAUTHENTICATED'
    ) {
      http.status = 401;
    } else if (
      error.message === 'Forbidden resource' ||
      error.extensions?.code === 'FORBIDDEN'
    ) {
      http.status = 403;
      http.status = 403;
    }
  }
}
