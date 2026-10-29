import { Inject, Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import type { Redis } from 'ioredis';
import { REDIS_CLIENT } from './redis.provider.js';

const VERSION_KEY = 'cache:version';
const DEFAULT_TTL_SECONDS = 300;

// Caches the result of expensive reads in Redis. Every key carries a version.
// Bumping the version makes all the older entries unreachable at once, and
// they expire on their own. A failing Redis never fails a request: the value
// is simply computed again.
@Injectable()
export class CacheService implements OnModuleDestroy {
  private readonly logger = new Logger(CacheService.name);

  constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis | null) {}

  async remember<T>(
    key: string,
    compute: () => Promise<T>,
    ttlSeconds = DEFAULT_TTL_SECONDS,
  ): Promise<T> {
    const redis = this.redis;

    if (!redis) {
      return compute();
    }

    let versionedKey: string | null = null;

    try {
      const version = (await redis.get(VERSION_KEY)) ?? '0';
      versionedKey = `cache:${version}:${key}`;
      const hit = await redis.get(versionedKey);

      if (hit !== null) {
        return JSON.parse(hit) as T;
      }
    } catch (error) {
      this.fail('read', error);
    }

    const value = await compute();

    if (versionedKey) {
      try {
        await redis.set(versionedKey, JSON.stringify(value), 'EX', ttlSeconds);
      } catch (error) {
        this.fail('write', error);
      }
    }

    return value;
  }

  // Call after a change, so that nobody is served the old data.
  async invalidate(): Promise<void> {
    try {
      await this.redis?.incr(VERSION_KEY);
    } catch (error) {
      this.fail('invalidate', error);
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.redis?.quit().catch(() => undefined);
  }

  private fail(action: string, error: unknown): void {
    const message = error instanceof Error ? error.message : String(error);
    this.logger.debug(`Cache ${action} failed: ${message}`);
  }
}
