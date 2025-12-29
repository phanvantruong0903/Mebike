import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsString } from 'class-validator';
import { StationStatus } from '../../../../prisma/index';

@InputType()
export class UpdateStationStatusInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  id!: string;

  @Field(() => StationStatus)
  @IsString()
  @IsNotEmpty()
  status!: StationStatus;
}
