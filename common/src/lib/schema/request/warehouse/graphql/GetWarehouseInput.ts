import { PaginationInput } from '../../../../graphql/abstract-input';
import { InputType } from '@nestjs/graphql';

@InputType()
export class GetWarehouseInput extends PaginationInput {}
