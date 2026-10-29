import { useQuery } from '@tanstack/react-query';
import { authService } from '../../services/authService.ts';

// Sign-up is closed until the server says otherwise, so the form never flashes.
export function useRegistrationEnabled(): boolean {
  const { data } = useQuery({
    queryKey: ['auth', 'config'],
    queryFn: authService.getConfig,
    staleTime: Infinity,
    retry: false,
  });

  return data?.registrationEnabled ?? false;
}
