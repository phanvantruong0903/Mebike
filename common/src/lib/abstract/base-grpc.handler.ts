import { throwGrpcError } from '../utils/grpc-response';
import { BaseService } from './base.service';
import { SERVER_MESSAGE, USER_MESSAGES } from '../constants/messages';

export class BaseGrpcHandler<
  T,
  CreateDto extends object | never = never,
  UpdateDto extends object | never = never,
> {
  constructor(
    protected readonly service: BaseService<T, CreateDto, UpdateDto>,
    _createDtoClass?: new () => CreateDto, // eslint-disable-line @typescript-eslint/no-unused-vars
    _updateDtoClass?: new () => UpdateDto, // eslint-disable-line @typescript-eslint/no-unused-vars
  ) {}

  async createLogic(dto: CreateDto): Promise<T> {
    // Check if the create method is implemented in the service
    if (!this.service.create) {
      throwGrpcError(501, SERVER_MESSAGE.UNSUPPORTED_OPERATION, [
        'Create method is not implemented.',
      ]);
    }
    try {
      const result = await this.service.create(dto);
      return result;
    } catch (error: any) {
      // Lỗi field unique trùng
      if (error?.code === 'P2002') {
        const fields: string[] = error.meta?.target ?? [];

        const isLocationDuplicated =
          Array.isArray(fields) &&
          fields.includes('latitude') &&
          fields.includes('longitude');

        if (isLocationDuplicated) {
          throwGrpcError(409, SERVER_MESSAGE.UNIQUE_CONSTRAINT_FAILED, [
            'Station at this location (latitude, longitude) already exists',
          ]);
        }
        const messages = fields.map((field) => {
          switch (field) {
            case 'email':
              return USER_MESSAGES.EMAIL_EXISTED;
            default:
              return `${field} existed`;
          }
        });
        throwGrpcError(409, SERVER_MESSAGE.UNIQUE_CONSTRAINT_FAILED, messages);
      }

      // Lỗi Khi truyền một field FK không tồn tại trong database
      if (error?.code === 'P2003') {
        const field = error.meta?.field_name ?? 'relation';
        throwGrpcError(400, SERVER_MESSAGE.FOREIGN_KEY_FAILED, [
          SERVER_MESSAGE.FOREIGN_KEY_INVALID(field),
        ]);
      }

      throwGrpcError(500, SERVER_MESSAGE.DATABASE_ERROR, [
        error.message ?? SERVER_MESSAGE.UNEXPECTED_ERROR,
      ]);
    }
  }

  async getAllLogic(
    page = 1,
    limit = 10,
    filter?: any,
    orderBy?: any,
    include?: any,
  ): Promise<{
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    return await this.service.findAll(page, limit, filter, orderBy, include);
  }

  async getOneById(id: string): Promise<T | null> {
    try {
      const result = await this.service.findOne(id);
      return result;
    } catch (error: any) {
      if (error?.code === 'P2025') {
        throwGrpcError(404, SERVER_MESSAGE.NOT_FOUND, [
          SERVER_MESSAGE.NOT_FOUND,
        ]);
      }

      throwGrpcError(500, SERVER_MESSAGE.DATABASE_ERROR, [
        error.message ?? SERVER_MESSAGE.UNEXPECTED_ERROR,
      ]);
    }
  }

  async updateLogic(id: string, dto: UpdateDto): Promise<T> {
    // Check if the update method is implemented in the service
    if (!this.service.update) {
      throwGrpcError(501, SERVER_MESSAGE.UNSUPPORTED_OPERATION, [
        SERVER_MESSAGE.UPDATED_NOT_IMPLEMENTED,
      ]);
    }
    try {
      const result = await this.service.update(id, dto);
      return result;
    } catch (error: any) {
      if (error?.code === 'P2002') {
        const fields: string[] = error.meta?.target ?? [];
        const isLocationDuplicated =
          Array.isArray(fields) &&
          fields.includes('latitude') &&
          fields.includes('longitude');

        if (isLocationDuplicated) {
          throwGrpcError(409, SERVER_MESSAGE.UNIQUE_CONSTRAINT_FAILED, [
            'Station at this location (latitude, longitude) already exists',
          ]);
        }

        const messages = fields.map((field) => {
          switch (field) {
            case 'email':
              return USER_MESSAGES.EMAIL_EXISTED;
            default:
              return `${field} existed`;
          }
        });
        throwGrpcError(409, SERVER_MESSAGE.UNIQUE_CONSTRAINT_FAILED, messages);
      }

      if (error?.code === 'P2003') {
        const field = error.meta?.field_name ?? 'relation';
        throwGrpcError(400, SERVER_MESSAGE.FOREIGN_KEY_FAILED, [
          SERVER_MESSAGE.FOREIGN_KEY_INVALID(field),
        ]);
      }

      if (error?.code === 'P2025') {
        throwGrpcError(404, SERVER_MESSAGE.NOT_FOUND, [
          SERVER_MESSAGE.NOT_FOUND,
        ]);
      }

      throwGrpcError(500, SERVER_MESSAGE.DATABASE_ERROR, [
        error.message ?? SERVER_MESSAGE.UNEXPECTED_ERROR,
      ]);
    }
  }

  async deleteLogic(id: string): Promise<T> {
    // Check if the delete method is implemented in the service
    if (!this.service.remove) {
      throwGrpcError(501, SERVER_MESSAGE.UNSUPPORTED_OPERATION, [
        SERVER_MESSAGE.DELETED_NOT_IMPLEMENTED,
      ]);
    }
    try {
      const result = await this.service.remove(id);
      return result;
    } catch (error: any) {
      if (error?.code === 'P2025') {
        throwGrpcError(404, SERVER_MESSAGE.NOT_FOUND, [
          SERVER_MESSAGE.NOT_FOUND,
        ]);
      }

      throwGrpcError(500, SERVER_MESSAGE.DATABASE_ERROR, [
        error.message ?? SERVER_MESSAGE.UNEXPECTED_ERROR,
      ]);
    }
  }
}
