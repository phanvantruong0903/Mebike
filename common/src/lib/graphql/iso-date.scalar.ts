import { CustomScalar, Scalar } from '@nestjs/graphql';
import { Kind, ValueNode } from 'graphql';

@Scalar('IsoDate', () => String)
export class IsoDateScalar implements CustomScalar<string, string> {
  description = 'ISO Date custom scalar type';
  parseValue(value: unknown): string {
    if (typeof value === 'string') {
      return new Date(value).toISOString();
    }
    throw new Error('IsoDate scalar only accepts string input');
  }

  serialize(value: unknown): string {
    if (!value) return '';

    try {
      const date = new Date(value as string);
      if (Number.isNaN(date.getTime())) {
        return '';
      }
      return date.toISOString();
    } catch (error) {
      console.error(error);
      return '';
    }
  }

  parseLiteral(ast: ValueNode): string {
    if (ast.kind === Kind.STRING) {
      return new Date(ast.value).toISOString();
    }
    return '';
  }
}
