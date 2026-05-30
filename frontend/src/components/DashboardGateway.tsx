import { useUser } from '@clerk/clerk-react';
import { Navigate } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { getFallbackUsername } from '../lib/utils';

/**
 * Acts as a redirect gateway for the `/dashboard` route.
 * Redirects authenticated users to their unique dashboard route (`/dashboard/:username`).
 */
export default function DashboardGateway() {
  const { user, isLoaded } = useUser();

  if (!isLoaded) {
    return (
      <div className="h-screen bg-paper flex items-center justify-center">
        <Lock className="w-8 h-8 text-brand animate-pulse" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/sign-in" replace />;
  }

  const username = getFallbackUsername(user);
  return <Navigate to={`/dashboard/${username}`} replace />;
}
