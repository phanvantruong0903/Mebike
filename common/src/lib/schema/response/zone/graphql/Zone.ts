import { Field, ID, ObjectType } from '@nestjs/graphql';
import { ZoneType } from '../../../../prisma/index';

@ObjectType()
export class Zone {
  @Field(() => ID)
  id!: string;

  @Field()
  name!: string;

  @Field(() => ZoneType)
  type!: ZoneType;
}
