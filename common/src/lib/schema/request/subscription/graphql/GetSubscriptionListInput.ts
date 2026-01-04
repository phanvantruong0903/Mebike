import { InputType } from '@nestjs/graphql';
import { PaginationInput } from 'src/lib/graphql';

@InputType()
export class GetSubscriptionListInput extends PaginationInput {}
