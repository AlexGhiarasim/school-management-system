import { afterEach, describe, expect, it, vi } from 'vitest';
import { ApiError, apiRequest, setUnauthorizedHandler } from './api.ts';

function mockFetch(status: number, body?: unknown) {
  const fetchMock = vi.fn().mockResolvedValue(
    new Response(body === undefined ? null : JSON.stringify(body), {
      status,
    }),
  );
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

afterEach(() => {
  vi.unstubAllGlobals();
  setUnauthorizedHandler(null);
});

describe('apiRequest', () => {
  it('returns the parsed body and sends the bearer token', async () => {
    const fetchMock = mockFetch(200, { id: 1 });

    await expect(apiRequest('/auth/me', { token: 'abc' })).resolves.toEqual({
      id: 1,
    });
    expect(fetchMock.mock.calls[0][1].headers).toMatchObject({
      Authorization: 'Bearer abc',
    });
  });

  it('throws an ApiError carrying the status and the server message', async () => {
    mockFetch(400, {
      message: ['email must be an email', 'password too short'],
    });

    await expect(apiRequest('/auth/login')).rejects.toMatchObject({
      status: 400,
      message: 'email must be an email, password too short',
    });
  });

  it('reports an unreachable server as status 0', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('offline')));

    const error: unknown = await apiRequest('/auth/login').catch(
      (caught: unknown) => caught,
    );

    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).status).toBe(0);
  });

  it('signs out when a request with a token is rejected', async () => {
    const handler = vi.fn();
    setUnauthorizedHandler(handler);
    mockFetch(401, { message: 'Unauthorized' });

    await apiRequest('/auth/me', { token: 'expired' }).catch(() => undefined);

    expect(handler).toHaveBeenCalledOnce();
  });

  it('does not sign out when the login credentials are wrong', async () => {
    const handler = vi.fn();
    setUnauthorizedHandler(handler);
    mockFetch(401, { message: 'Invalid email or password' });

    await apiRequest('/auth/login', { method: 'POST', body: {} }).catch(
      () => undefined,
    );

    expect(handler).not.toHaveBeenCalled();
  });
});
