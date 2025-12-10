import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

@InputType()
export class CreateBikeInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  name!: string;

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  address!: string;

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  chipId!: string;

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  stationId!: string;

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  supplierId!: string;
}
