import { Catch } from '@nestjs/common';
import { GqlExceptionFilter } from '@nestjs/graphql';
import { RpcException } from '@nestjs/microservices';
import { GraphQLError } from 'graphql';

@Catch(RpcException)
export class RpcExceptionsFilter implements GqlExceptionFilter {
  catch(exception: RpcException) {
    const err = exception.getError();

    let parsed: unknown = err;
    if (typeof err === 'string') {
      try {
        parsed = JSON.parse(err);
      } catch {
        parsed = err;
      }
    }

    const p = parsed as {
      statusCode?: number;
      response?: any;
      message?: string;
      status?: number;
    };

    const statusCode =
      p.statusCode ?? p.response?.statusCode ?? p.status ?? 500;
    const message =
      p.message ?? (typeof err === 'string' ? err : JSON.stringify(parsed));

    return new GraphQLError(message, {
      extensions: { statusCode, response: p },
    });
  }
}
