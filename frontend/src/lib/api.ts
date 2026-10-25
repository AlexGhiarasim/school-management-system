const BASE_URL: string =
  import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';

export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

let onUnauthorized: (() => void) | null = null;

export function setUnauthorizedHandler(handler: (() => void) | null): void {
  onUnauthorized = handler;
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
  token?: string;
}

function readMessage(data: unknown): string {
  if (data && typeof data === 'object' && 'message' in data) {
    const { message } = data as { message: unknown };
    return Array.isArray(message) ? message.join(', ') : String(message);
  }

  return 'Request failed';
}

export async function apiRequest<T>(
  path: string,
  { method = 'GET', body, token }: RequestOptions = {},
): Promise<T> {
  let response: Response;

  try {
    response = await fetch(`${BASE_URL}${path}`, {
      method,
      headers: {
        ...(body !== undefined && { 'Content-Type': 'application/json' }),
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError(0, 'Network error');
  }

  const data: unknown =
    response.status === 204 ? null : await response.json().catch(() => null);

  if (!response.ok) {
    if (response.status === 401 && token) onUnauthorized?.();
    throw new ApiError(response.status, readMessage(data));
  }

  return data as T;
}
