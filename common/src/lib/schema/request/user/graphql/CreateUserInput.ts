import { Field, InputType, Int } from '@nestjs/graphql';
import { Role } from '../../../../prisma/index';

@InputType()
export class CreateUserInput {
  @Field({ nullable: true })
  email?: string;

  @Field({ nullable: true })
  name?: string;

  @Field(() => Int, { nullable: true })
  YOB?: number;

  @Field(() => String, { nullable: true })
  phone?: string;

  @Field(() => Role, { nullable: true })
  role?: Role;

  @Field(() => String, { nullable: true })
  workStationId?: string;
}
