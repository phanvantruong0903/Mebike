import { Field, Int, ObjectType } from '@nestjs/graphql';
import { StationSearchResult } from './StationSearchResult';

@ObjectType()
export class StationSearchPage {
  @Field(() => [StationSearchResult])
  data!: StationSearchResult[];

  @Field(() => Int)
  total!: number;

  @Field(() => Int)
  page!: number;

  @Field(() => Int)
  totalPages!: number;
}
