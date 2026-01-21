import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

@InputType()
export class CreateStationInput {
  @Field({ nullable: true })
  @IsString()
  @IsNotEmpty()
  name?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsNotEmpty()
  address?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsNotEmpty()
  latitude?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsNotEmpty()
  longitude?: string;

  @Field(() => Number, { nullable: true })
  @IsNumber()
  @IsNotEmpty()
  capacity?: number;
}
