import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { CacheInvalidationInterceptor } from './cache-invalidation.interceptor.js';
import { CacheService } from './cache.service.js';
import { createRedis, REDIS_CLIENT } from './redis.provider.js';

@Global()
@Module({
  providers: [
    {
      provide: REDIS_CLIENT,
      inject: [ConfigService],
      useFactory: createRedis,
    },
    CacheService,
    { provide: APP_INTERCEPTOR, useClass: CacheInvalidationInterceptor },
  ],
  exports: [CacheService],
})
export class CacheModule {}
