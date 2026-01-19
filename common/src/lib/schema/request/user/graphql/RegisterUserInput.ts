import { Field, InputType, OmitType } from '@nestjs/graphql';
import { CreateUserInput } from './CreateUserInput';

@InputType()
export class RegisterUserInput extends OmitType(CreateUserInput, [
  'role',
  'workStationId',
] as const) {
  @Field({ nullable: true })
  password?: string;

  @Field({ nullable: true })
  confirmPassword?: string;
}
