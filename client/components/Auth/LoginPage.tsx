import { useEffect } from 'react';

import { buildCentralAuthLoginUrl } from '../../utils/api';

export function LoginPage() {
  useEffect(() => {
    window.location.href = buildCentralAuthLoginUrl('/builder');
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="auth-card">
          <h1 className="mb-2 text-center text-2xl font-bold text-foreground">
            Parametric
          </h1>
          <p className="mb-6 text-center text-sm text-muted">
            Warframe Mod Builder
          </p>
          <p
            className="text-center text-sm text-muted"
            role="status"
            aria-live="polite"
          >
            Redirecting to shared authentication...
          </p>
        </div>
      </div>
    </div>
  );
}
