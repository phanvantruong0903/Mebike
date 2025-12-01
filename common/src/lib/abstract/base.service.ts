export abstract class BaseService<T, CreateDto = never, UpdateDto = never> {
  constructor(protected readonly model: any) {}

  create(dto: CreateDto): Promise<T> {
    return this.model.create({ data: dto });
  }

  async findAll(
    page = 1,
    limit = 10,
    filter?: any,
    orderBy?: any,
  ): Promise<{
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;

    const sort = orderBy || { createdAt: 'desc' };
    const [data, total] = await Promise.all([
      this.model.findMany({
        where: filter,
        skip,
        take: limit,
        orderBy: sort,
      }),
      this.model.count({
        where: filter,
      }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  findOne(id: string): Promise<T | null> {
    return this.model.findUnique({ where: { id } });
  }

  update(id: string, dto: UpdateDto): Promise<T> {
    return this.model.update({ where: { id }, data: dto });
  }

  remove(id: string): Promise<T> {
    return this.model.delete({ where: { id } });
  }

  changeStatus(id: string, fromStatus: string, toStatus: string): Promise<T> {
    return this.model.update({
      where: { id, status: fromStatus },
      data: { status: toStatus },
    });
  }
}
