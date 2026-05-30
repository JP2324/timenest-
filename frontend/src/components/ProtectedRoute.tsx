import { useAuth } from '@clerk/clerk-react';
import { Navigate, Outlet } from 'react-router-dom';
import { Lock } from 'lucide-react';

/**
 * Guards child routes behind Clerk authentication.
 * Shows a minimal loading state while Clerk initializes,
 * redirects to /sign-in if unauthenticated.
 */
export default function ProtectedRoute() {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) {
    return (
      <div className="h-screen bg-paper flex items-center justify-center">
        <Lock className="w-8 h-8 text-brand animate-pulse" />
      </div>
    );
  }

  if (!isSignedIn) {
    return <Navigate to="/sign-in" replace />;
  }

  return <Outlet />;
}
