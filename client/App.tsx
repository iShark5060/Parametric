import { AppRoutes } from './app/routes';
import { CompareProvider } from './context/CompareContext';
import { AuthProvider } from './features/auth/AuthContext';

export function App() {
  return (
    <AuthProvider>
      <CompareProvider>
        <AppRoutes />
      </CompareProvider>
    </AuthProvider>
  );
}
