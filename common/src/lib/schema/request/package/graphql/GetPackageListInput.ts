import { InputType } from '@nestjs/graphql';
import { PaginationInput } from '../../../../graphql/abstract-input';

@InputType()
export class GetPackageListInput extends PaginationInput {}
