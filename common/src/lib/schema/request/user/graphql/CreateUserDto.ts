import { Field, InputType, Int } from '@nestjs/graphql';
import { Role } from '../../../../prisma/index';

@InputType()
export class CreateUserInput {
  @Field()
  email!: string;

  @Field()
  name!: string;

  @Field()
  password!: string;

  @Field(() => Int)
  YOB!: number;

  @Field(() => Role)
  role!: Role;
}
