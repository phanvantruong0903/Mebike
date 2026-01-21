import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsString } from 'class-validator';
import { StationStatus } from '../../../../prisma/index';

@InputType()
export class UpdateStationStatusInput {
  @Field({ nullable: true })
  @IsString()
  @IsNotEmpty()
  id?: string;

  @Field(() => StationStatus, { nullable: true })
  @IsString()
  @IsNotEmpty()
  status?: StationStatus;
}
