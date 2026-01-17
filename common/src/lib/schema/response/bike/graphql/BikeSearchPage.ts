import { Field, Int, ObjectType } from '@nestjs/graphql';
import { BikeSearchResult } from './BikeSearchResult';

@ObjectType()
export class BikeSearchPage {
  @Field(() => [BikeSearchResult])
  data!: BikeSearchResult[];

  @Field(() => Int)
  total!: number;

  @Field(() => Int)
  page!: number;

  @Field(() => Int)
  totalPages!: number;
}
