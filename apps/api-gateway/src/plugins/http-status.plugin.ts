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
          const statusFromPayload = this.getStatusFromResponsePayload(response);
          if (statusFromPayload && response.http) {
            response.http.status = statusFromPayload;
          } else {
            console.log(response);
          }
        }
      },
    };
  }

  private getErrors(response: unknown): any[] | undefined {
    const r = response as any;
    if (r?.body?.kind === 'single') {
      return r.body.singleResult?.errors;
    }
    return r?.errors;
  }

  private getStatusCode(error: any): number | undefined {
    const direct =
      (error as any).statusCode ||
      error.extensions?.response?.statusCode ||
      error.extensions?.exception?.status ||
      error.extensions?.statusCode;

    if (direct) return direct;

    try {
      const parsed = JSON.parse(error.message);
      return (
        parsed?.statusCode || parsed?.response?.statusCode || parsed?.status
      );
    } catch {
      return undefined;
    }
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
    }
  }

  private getStatusFromResponsePayload(response: unknown): number | undefined {
    const r = response as any;
    const responseBody = r?.body?.singleResult?.data ?? r?.data;
    if (!responseBody) return undefined;

    const findStatus = (obj: unknown): number | undefined => {
      if (!obj || typeof obj !== 'object') return undefined;

      const o = obj as Record<string, unknown>;

      if (
        'statusCode' in o &&
        typeof o.statusCode === 'number' &&
        o.statusCode !== 200
      ) {
        return o.statusCode as number;
      }

      for (const value of Object.values(o)) {
        const found = findStatus(value);
        if (found) return found;
      }

      return undefined;
    };

    return findStatus(responseBody);
  }
}
