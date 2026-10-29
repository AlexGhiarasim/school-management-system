import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import type { Request } from 'express';
import { tap } from 'rxjs';
import { CacheService } from './cache.service.js';

const READ_METHODS = ['GET', 'HEAD', 'OPTIONS'];

// Any successful change clears the cache. Changes are rare compared to the
// reads, so this is simpler and safer than tracking what each one touches.
// Sign in, password and import preview requests change no school data.
@Injectable()
export class CacheInvalidationInterceptor implements NestInterceptor {
  constructor(private readonly cache: CacheService) {}

  intercept(context: ExecutionContext, next: CallHandler) {
    const { method, path } = context.switchToHttp().getRequest<Request>();
    const changesData =
      !READ_METHODS.includes(method) &&
      !path.startsWith('/api/auth') &&
      !path.endsWith('/preview');

    return next.handle().pipe(
      tap(() => {
        if (changesData) {
          void this.cache.invalidate();
        }
      }),
    );
  }
}
