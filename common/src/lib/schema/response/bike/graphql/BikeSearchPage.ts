import { Field, ObjectType } from '@nestjs/graphql';
import { BikeResult } from './BikeSearchResult';
import { PaginationMeta } from '../../../../graphql';

@ObjectType()
export class BikeSearchPage {
  @Field(() => [BikeResult])
  data!: BikeResult[];

  @Field(() => PaginationMeta)
  pagination!: PaginationMeta;
}
