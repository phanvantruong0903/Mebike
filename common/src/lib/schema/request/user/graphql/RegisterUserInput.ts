import { Field, InputType, OmitType } from '@nestjs/graphql';
import { CreateUserInput } from './CreateUserInput';

@InputType()
export class RegisterUserInput extends OmitType(CreateUserInput, [
  'role',
] as const) {
  @Field()
  password!: string;
}
