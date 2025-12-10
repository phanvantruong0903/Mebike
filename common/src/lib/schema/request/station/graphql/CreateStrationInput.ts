import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

@InputType()
export class CreateStationInput {
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
  latitude!: string;

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  longitude!: string;

  @Field(() => Number)
  @IsNumber()
  @IsNotEmpty()
  capacity!: number;
}
