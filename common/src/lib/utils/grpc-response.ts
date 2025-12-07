import { RpcException } from '@nestjs/microservices';
import { ErrorResponse } from '../interfaces/api-response';

export function throwGrpcError(
  statusCode: number,
  message: string,
  errors?: string[],
): never {
  const errorResponse: ErrorResponse = {
    success: false,
    message,
    errors,
    statusCode,
  };
  throw new RpcException(errorResponse);
}

export function grpcResponse<T>(
  data: T | T[],
  message = 'Success',
  statusCode = 200,
) {
  return {
    success: true,
    message,
    data,
    statusCode,
  };
}

export function grpcPaginateResponse<T>(
  result: {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  },
  message = 'Success',
  statusCode = 200,
) {
  return {
    success: true,
    message,
    data: result.data.length == 0 ? [] : result.data,
    total: result.total,
    page: result.page,
    limit: result.limit,
    totalPages: result.totalPages,
    statusCode,
  };
}
