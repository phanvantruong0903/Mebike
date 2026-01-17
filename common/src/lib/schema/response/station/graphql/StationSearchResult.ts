import { Field, ObjectType } from '@nestjs/graphql';
import { Station } from './Station';

@ObjectType()
export class StationSearchResult {
  @Field(() => [Station])
  data!: Station[];
}
