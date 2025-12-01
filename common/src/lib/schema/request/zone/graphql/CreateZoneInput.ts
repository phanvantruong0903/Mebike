import { Field, InputType } from '@nestjs/graphql';
import { ZoneType } from '../../../../prisma/index';

@InputType()
export class CreateZoneInput {
  @Field()
  wareHouseId!: string;

  @Field()
  name!: string;

  @Field(() => ZoneType)
  type!: ZoneType;
}
