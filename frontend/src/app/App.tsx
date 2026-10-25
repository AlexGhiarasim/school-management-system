import { LoadingScreen } from '../components/layout/LoadingScreen.tsx';
import { AuthProvider } from '../features/auth/AuthProvider.tsx';
import { useAuth } from '../hooks/useAuth.ts';
import DashboardPage from '../pages/DashboardPage.tsx';
import HomePage from '../pages/HomePage.tsx';

function Screens() {
  const { status } = useAuth();

  if (status === 'loading') return <LoadingScreen />;

  return status === 'authenticated' ? <DashboardPage /> : <HomePage />;
}

export default function App() {
  return (
    <AuthProvider>
      <Screens />
    </AuthProvider>
  );
}
