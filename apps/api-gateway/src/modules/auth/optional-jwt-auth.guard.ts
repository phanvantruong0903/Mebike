import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  override getRequest(context: ExecutionContext) {
    const contextType = context.getType<string>();

    if (contextType === 'graphql') {
      const ctx = GqlExecutionContext.create(context);
      return ctx.getContext().req;
    }

    return context.switchToHttp().getRequest();
  }

  override handleRequest(
    err: any,
    user: any,
    info: any,
    context: ExecutionContext,
  ) {
    const request = this.getRequest(context);
    const token = request?.headers?.authorization;

    if (token && (err || !user)) {
      throw new UnauthorizedException('Token expired or invalid');
    }

    if (!token) {
      return undefined;
    }

    return user;
  }
}
