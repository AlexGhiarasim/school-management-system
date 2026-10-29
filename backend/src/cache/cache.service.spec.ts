import type { Redis } from 'ioredis';
import { CacheService } from './cache.service.js';

function createRedis() {
  const store = new Map<string, string>();

  return {
    get: vi.fn((key: string) => Promise.resolve(store.get(key) ?? null)),
    set: vi.fn((key: string, value: string) => {
      store.set(key, value);
      return Promise.resolve('OK');
    }),
    incr: vi.fn(() => {
      store.set(
        'cache:version',
        String(Number(store.get('cache:version') ?? 0) + 1),
      );
      return Promise.resolve(1);
    }),
    quit: vi.fn(() => Promise.resolve('OK')),
  };
}

describe('CacheService', () => {
  it('computes a value once and then serves it from Redis', async () => {
    const service = new CacheService(createRedis() as unknown as Redis);
    const compute = vi.fn().mockResolvedValue({ total: 3 });

    await service.remember('stats', compute);
    const second = await service.remember('stats', compute);

    expect(second).toEqual({ total: 3 });
    expect(compute).toHaveBeenCalledTimes(1);
  });

  it('computes again after the cache was invalidated', async () => {
    const service = new CacheService(createRedis() as unknown as Redis);
    const compute = vi.fn().mockResolvedValue('value');

    await service.remember('stats', compute);
    await service.invalidate();
    await service.remember('stats', compute);

    expect(compute).toHaveBeenCalledTimes(2);
  });

  it('still answers when Redis fails', async () => {
    const redis = createRedis();
    redis.get.mockRejectedValue(new Error('connection lost'));
    const service = new CacheService(redis as unknown as Redis);

    await expect(
      service.remember('stats', () => Promise.resolve(7)),
    ).resolves.toBe(7);
  });

  it('works without Redis', async () => {
    const service = new CacheService(null);

    await expect(
      service.remember('stats', () => Promise.resolve(1)),
    ).resolves.toBe(1);
    await expect(service.invalidate()).resolves.toBeUndefined();
  });
});
