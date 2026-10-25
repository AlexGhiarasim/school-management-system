import { QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router';
import { LoadingScreen } from '../components/layout/LoadingScreen.tsx';
import { ToastProvider } from '../components/ui/ToastProvider.tsx';
import { AuthProvider } from '../features/auth/AuthProvider.tsx';
import { useAuth } from '../hooks/useAuth.ts';
import { queryClient } from '../lib/queryClient.ts';
import { AppRoutes } from '../routes/AppRoutes.tsx';

function Screens() {
  const { status } = useAuth();

  return status === 'loading' ? <LoadingScreen /> : <AppRoutes />;
}

export default function App() {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <AuthProvider>
            <Screens />
          </AuthProvider>
        </ToastProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
}
