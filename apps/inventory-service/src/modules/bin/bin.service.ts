import {
  BaseService,
  Bin,
  CreateBinDto,
  prismaInventory,
  UpdateBinDto,
  WAREHOUSE_MESSAGES,
} from '@loginex/common';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

@Injectable()
export class BinService extends BaseService<Bin, CreateBinDto, UpdateBinDto> {
  constructor() {
    super(prismaInventory.bin);
  }

  override async create(data: CreateBinDto): Promise<Bin> {
    const existing = await this.model.findUnique({
      where: { code: data.code },
    });
    if (existing) {
      throw new BadRequestException(WAREHOUSE_MESSAGES.BIN_CODE_EXISTS);
    }
    return super.create(data);
  }

  override async remove(id: string): Promise<Bin> {
    const bin = await this.findOne(id);
    if (!bin) {
      throw new NotFoundException(WAREHOUSE_MESSAGES.BIN_NOT_FOUND);
    }
    return super.remove(id);
  }
}
