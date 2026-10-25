import { QueryClient } from '@tanstack/react-query';
import { ApiError } from './api.ts';

const MAX_RETRIES = 2;

function isClientError(error: unknown): boolean {
  return error instanceof ApiError && error.status >= 400 && error.status < 500;
}

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        refetchOnWindowFocus: false,
        retry: (failureCount, error) =>
          failureCount < MAX_RETRIES && !isClientError(error),
      },
    },
  });
}

export const queryClient = createQueryClient();
