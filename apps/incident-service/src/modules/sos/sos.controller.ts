import { Controller, UsePipes, ValidationPipe } from '@nestjs/common';
import {
  BaseGrpcHandler,
  SosModel,
  CreateSosDto,
  UpdateSosDto,
  GRPC_SERVICES,
  SOS_METHODS,
  GetSosDto,
  grpcPaginateResponse,
  SOS_MESSAGES,
  GetSosByIdDto,
  grpcResponse,
  Role,
  EmergencyStatus,
  throwGrpcError,
} from '@mebike/common';
import { SosService } from './sos.service';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { TemporalService } from '../../saga/temporal-service';

@Controller()
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class SosController {
  private readonly baseHandler: BaseGrpcHandler<
    SosModel,
    CreateSosDto,
    UpdateSosDto
  >;

  constructor(
    private readonly sosService: SosService,
    private readonly temporalService: TemporalService,
  ) {
    this.baseHandler = new BaseGrpcHandler(
      this.sosService,
      CreateSosDto,
      UpdateSosDto,
    );
  }

  @GrpcMethod(GRPC_SERVICES.INCIDENT, SOS_METHODS.GET_ALL)
  async getAllSos(
    data: GetSosDto,
  ): Promise<ReturnType<typeof grpcPaginateResponse>> {
    try {
      const { page, limit, status, accountId, role } = data;
      const filter: any = {};
      if (status) filter.status = status;
      if (role === Role.USER) filter.requesterId = accountId;
      if (role === Role.SOS) {
        filter.agentId = accountId;
        filter.status = {
          in: [
            EmergencyStatus.Assigned,
            EmergencyStatus.Processing,
            EmergencyStatus.Resolved,
            EmergencyStatus.Unsolvable,
          ],
        };
      }

      const result = await this.baseHandler.getAllLogic(page, limit, filter);
      return grpcPaginateResponse(result, SOS_MESSAGES.GET_ALL_SUCCESS);
    } catch (error) {
      if (error instanceof RpcException) {
        throw error;
      }
      const err = error as Error;
      throw new RpcException(err?.message || SOS_MESSAGES.GET_ALL_FAIL);
    }
  }

  @GrpcMethod(GRPC_SERVICES.INCIDENT, SOS_METHODS.GET_ONE)
  async getSosDetails(
    data: GetSosByIdDto,
  ): Promise<ReturnType<typeof grpcResponse>> {
    try {
      const result = await this.baseHandler.getOneById(data.id);
      return grpcResponse(result, SOS_MESSAGES.GET_ONE_SUCCESS);
    } catch (error) {
      if (error instanceof RpcException) {
        throw error;
      }
      const err = error as Error;
      throw new RpcException(err?.message || SOS_MESSAGES.GET_ONE_FAILED);
    }
  }

  @GrpcMethod(GRPC_SERVICES.INCIDENT, SOS_METHODS.CREATE)
  async createSos(
    data: CreateSosDto,
  ): Promise<ReturnType<typeof grpcResponse>> {
    try {
      const workflowId = await this.temporalService.startSosCreationWorkflow(
        data,
      );
      const result = await this.temporalService.getSosCreationWorkflowResult(
        workflowId,
      );

      if (!result.success) {
        throwGrpcError(result.statusCode, result.message, result.errors);
      }

      return grpcResponse(result.data, SOS_MESSAGES.CREATE_SUCCESS);
    } catch (error) {
      if (error instanceof RpcException) {
        throw error;
      }

      const err = error as Error;
      throw new RpcException(err?.message || SOS_MESSAGES.CREATE_FAILED);
    }
  }

  @GrpcMethod(GRPC_SERVICES.INCIDENT, SOS_METHODS.UPDATE_STATUS)
  async updateSosStatus(
    data: UpdateSosDto,
  ): Promise<ReturnType<typeof grpcResponse>> {
    try {
      const result = await this.sosService.updateSosStatus(data);
      return grpcResponse(result, SOS_MESSAGES.UPDATE_SUCCESS);
    } catch (error) {
      if (error instanceof RpcException) {
        throw error;
      }
      const err = error as Error;
      throw new RpcException(err?.message || SOS_MESSAGES.UPDATE_FAILED);
    }
  }
}
