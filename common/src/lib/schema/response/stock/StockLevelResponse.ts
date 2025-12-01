import { Field, ObjectType } from '@nestjs/graphql';
import { StockLevelData } from './StockLevelData';

@ObjectType()
export class StockLevelResponse {
  @Field()
  success!: boolean;

  @Field()
  message!: string;

  @Field(() => StockLevelData, { nullable: true })
  data?: StockLevelData;

  @Field(() => [String], { nullable: true })
  errors?: string[];
}
