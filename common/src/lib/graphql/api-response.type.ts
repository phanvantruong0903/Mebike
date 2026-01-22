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

/**
 * Create an abstract GraphQL ObjectType class that represents a standardized API response for the provided item type.
 *
 * When `options.isArray` is `true`, the generated class exposes `data` as an array of the item type and includes a nullable `pagination` field; otherwise `data` is a single nullable item.
 *
 * @param TItemClass - The class constructor used as the GraphQL type for the `data` field
 * @param options - Optional settings; set `options.isArray` to `true` to produce a paginated (array) response type
 * @returns The generated abstract GraphQL ObjectType class representing the API response. If `options.isArray` is `true`, the returned class is paginated (array `data` plus `pagination`); otherwise it is a standard response class (single-item `data`)
 */
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