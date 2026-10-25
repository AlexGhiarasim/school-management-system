import { BrowserRouter } from 'react-router';
import { LoadingScreen } from '../components/layout/LoadingScreen.tsx';
import { AuthProvider } from '../features/auth/AuthProvider.tsx';
import { useAuth } from '../hooks/useAuth.ts';
import { AppRoutes } from '../routes/AppRoutes.tsx';

function Screens() {
  const { status } = useAuth();

  return status === 'loading' ? <LoadingScreen /> : <AppRoutes />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Screens />
      </AuthProvider>
    </BrowserRouter>
  );
}
