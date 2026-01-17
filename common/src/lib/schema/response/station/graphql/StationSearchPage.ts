import { Field, ObjectType } from '@nestjs/graphql';
import { Station } from './Station';
import { PaginationMeta } from '../../../../graphql';

@ObjectType()
export class StationSearchPage {
  @Field(() => [Station])
  data!: Station[];

  @Field(() => PaginationMeta)
  pagination!: PaginationMeta;
}
