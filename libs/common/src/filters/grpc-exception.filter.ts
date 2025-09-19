import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ExceptionFilter,
} from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { ErrorResponse } from '../interfaces/api-response';
import { SERVER_MESSAGE } from '../constants/messages';

@Catch()
export class GrpcExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    // ===== Validation lỗi từ ValidationPipe =====
    if (exception instanceof BadRequestException) {
      const res: any = exception.getResponse();
      const messages = Array.isArray(res.message) ? res.message : [res.message];

      const errorResponse: ErrorResponse = {
        success: false,
        message: SERVER_MESSAGE.VALIDATION_FAILED,
        errors: messages,
      };

      console.error(
        'Validation Error:',
        JSON.stringify(errorResponse, null, 2)
      );
      return errorResponse;
    }

    // ===== Trường hợp RpcException =====
    if (exception instanceof RpcException) {
      const error = exception.getError();
      let response: any;

      try {
        // Bắt buộc parse JSON
        response = typeof error === 'string' ? JSON.parse(error) : error;
      } catch {
        response = {
          success: false,
          message: SERVER_MESSAGE.RCP_EXCEPTION,
          errors: [String(error)],
        };
      }

      return response;
    }

    // ===== Các lỗi khác (Internal) =====
    const fallback = {
      success: false,
      message: SERVER_MESSAGE.INTERNAL_SERVER,
      errors: [exception.message || SERVER_MESSAGE.UNEXPECTED_ERROR],
    };

    console.error('Unknown Error:', JSON.stringify(fallback, null, 2));
    return fallback;
  }
}
