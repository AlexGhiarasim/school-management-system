import { Navigate, Outlet } from 'react-router';
import type { Role } from '../features/auth/types.ts';
import { useAuth } from '../hooks/useAuth.ts';
import { paths, roleHome } from './paths.ts';

export function PublicOnly() {
  const { user } = useAuth();

  return user ? <Navigate to={roleHome[user.role]} replace /> : <Outlet />;
}

export function RequireAuth() {
  const { user } = useAuth();

  return user ? <Outlet /> : <Navigate to={paths.home} replace />;
}

export function RequireRole({ role }: { role: Role }) {
  const { user } = useAuth();

  if (!user) return <Navigate to={paths.home} replace />;
  if (user.role !== role) return <Navigate to={roleHome[user.role]} replace />;

  return <Outlet />;
}
