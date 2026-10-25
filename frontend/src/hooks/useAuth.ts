import { useContext } from 'react';
import { AuthContext } from '../features/auth/authContext.ts';

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside an AuthProvider');
  }

  return context;
}
