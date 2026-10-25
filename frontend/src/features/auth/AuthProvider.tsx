import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { ApiError } from '../../lib/api.ts';
import { clearToken, getToken, saveToken } from '../../lib/tokenStorage.ts';
import { authService } from '../../services/authService.ts';
import { AuthContext, type AuthStatus } from './authContext.ts';
import type { CurrentUser, RegisterPayload } from './types.ts';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [status, setStatus] = useState<AuthStatus>(() =>
    getToken() ? 'loading' : 'anonymous',
  );

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
    setStatus('anonymous');
  }, []);

  const startSession = useCallback(async (token: string) => {
    saveToken(token);

    try {
      setUser(await authService.getMe(token));
      setStatus('authenticated');
    } catch (error) {
      clearToken();
      throw error;
    }
  }, []);

  useEffect(() => {
    const token = getToken();
    if (!token) return;

    let cancelled = false;

    authService
      .getMe(token)
      .then((current) => {
        if (cancelled) return;
        setUser(current);
        setStatus('authenticated');
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        if (error instanceof ApiError && error.status === 401) clearToken();
        setStatus('anonymous');
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const { accessToken } = await authService.login(email, password);
      await startSession(accessToken);
    },
    [startSession],
  );

  const register = useCallback(
    async (payload: RegisterPayload) => {
      const { accessToken } = await authService.register(payload);
      await startSession(accessToken);
    },
    [startSession],
  );

  const value = useMemo(
    () => ({ status, user, login, register, logout }),
    [status, user, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
