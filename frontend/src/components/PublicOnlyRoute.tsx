import { useAuth } from '@clerk/clerk-react';
import { Navigate, Outlet } from 'react-router-dom';
import { Lock } from 'lucide-react';

/**
 * Prevents already-authenticated users from seeing auth pages.
 * Redirects signed-in users to /dashboard.
 */
export default function PublicOnlyRoute() {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) {
    return (
      <div className="h-screen bg-paper flex items-center justify-center">
        <Lock className="w-8 h-8 text-brand animate-pulse" />
      </div>
    );
  }

  if (isSignedIn) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
