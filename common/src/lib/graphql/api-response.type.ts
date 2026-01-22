import { Field, ObjectType, Int } from '@nestjs/graphql';

type ClassType<T = unknown> = new (...args: unknown[]) => T;

interface ApiResponseOptions {
  isArray?: boolean;
}

@ObjectType()
export class PaginationMeta {
  @Field(() => Int, { nullable: true })
  total?: number;

  @Field(() => Int, { nullable: true })
  page?: number;

  @Field(() => Int, { nullable: true })
  limit?: number;

  @Field(() => Int, { nullable: true })
  totalPages?: number;
}

export function ApiResponseType<TItem>(
  TItemClass: ClassType<TItem>,
  options: ApiResponseOptions = {},
) {
  const { isArray = false } = options;

  @ObjectType({ isAbstract: true })
  abstract class ApiResponseClass {
    @Field()
    success!: boolean;

    @Field()
    message!: string;

    @Field(() => (isArray ? [TItemClass] : TItemClass), { nullable: true })
    data?: TItem | TItem[] | null;

    @Field(() => [String], { nullable: true })
    errors?: string[];

    @Field(() => Int, { nullable: true })
    statusCode?: number;
  }

  if (isArray) {
    @ObjectType({ isAbstract: true })
    abstract class ApiPaginatedResponseClass extends ApiResponseClass {
      @Field(() => PaginationMeta, { nullable: true })
      pagination?: PaginationMeta;
    }
    return ApiPaginatedResponseClass;
  }

  return ApiResponseClass;
}
