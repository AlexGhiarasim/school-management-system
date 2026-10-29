import { Logger } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';

export const REDIS_CLIENT = Symbol('REDIS_CLIENT');

// Redis is optional: without REDIS_URL the application works without a cache.
export function createRedis(config: ConfigService): Redis | null {
  const url = config.get<string>('REDIS_URL');

  if (!url) {
    return null;
  }

  const logger = new Logger('Redis');
  const redis = new Redis(url, {
    // Fail fast while Redis is down, so a request is never held up by it.
    maxRetriesPerRequest: 1,
    enableOfflineQueue: false,
    retryStrategy: (attempt) => Math.min(attempt * 200, 5000),
  });

  // Log when it goes down and when it is back, not on every retry.
  let down = false;

  redis.on('error', (error: Error) => {
    if (!down) {
      down = true;
      logger.warn(`Unavailable, serving without cache: ${error.message}`);
    }
  });
  redis.on('ready', () => {
    if (down) {
      down = false;
      logger.log('Connected again');
    }
  });

  return redis;
}
