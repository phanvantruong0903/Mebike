import { Request } from 'express';

export function getClientIp(req: Request): string {
  return (
    (req.headers['x-forwarded-for'] as string) ||
    req.connection?.remoteAddress ||
    req.socket?.remoteAddress ||
    (req.connection as any)?.socket?.remoteAddress ||
    '127.0.0.1'
  );
}
