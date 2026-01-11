import { Field, InputType, Int } from '@nestjs/graphql';
import { Role } from '../../../../prisma/index';

@InputType()
export class CreateUserInput {
  @Field()
  email!: string;

  @Field()
  name!: string;

  @Field(() => Int)
  YOB!: number;

  @Field(() => String)
  phone!: string;

  @Field(() => Role)
  role!: Role;

  @Field(() => String, { nullable: true })
  workStationId?: string;
}
