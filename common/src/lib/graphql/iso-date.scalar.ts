import { CustomScalar, Scalar } from '@nestjs/graphql';
import { Kind, ValueNode } from 'graphql';

@Scalar('IsoDate', () => String)
export class IsoDateScalar implements CustomScalar<string, string> {
  description = 'ISO Date custom scalar type';
  parseValue(value: unknown): string {
    const date = new Date(value as string);
    if (Number.isNaN(date.getTime())) {
      throw new Error(`Invalid date value: ${value}`);
    }
    return date.toISOString();
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
      const date = new Date(ast.value);
      if (Number.isNaN(date.getTime())) {
        return '';
      }
      return date.toISOString();
    }
    return '';
  }
}
