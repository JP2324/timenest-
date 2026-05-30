import { useEffect, useRef } from 'react';
import { useUser, useAuth } from '@clerk/clerk-react';
import { getFallbackUsername } from '../lib/utils';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

/**
 * Fire-and-forget hook that syncs the authenticated Clerk user
 * into MongoDB via the backend POST /api/users/sync endpoint.
 * Runs once per session load — guarded by a ref to avoid duplicate calls.
 */
export function useUserSync(): void {
  const { user, isLoaded: isUserLoaded } = useUser();
  const { getToken } = useAuth();
  const hasSynced = useRef(false);

  useEffect(() => {
    if (!isUserLoaded || !user || hasSynced.current) return;

    const syncUser = async () => {
      try {
        const token = await getToken();

        const username = getFallbackUsername(user);

        const response = await fetch(`${API_BASE_URL}/users/sync`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            clerkId: user.id,
            email: user.primaryEmailAddress?.emailAddress,
            username: username,
            firstName: user.firstName,
            lastName: user.lastName,
            fullName: user.fullName,
            imageUrl: user.imageUrl,
          }),
        });

        if (!response.ok) {
          const errText = await response.text();
          console.error(`User sync failed with status ${response.status}:`, errText);
          return;
        }

        hasSynced.current = true;
      } catch (error) {
        console.error('User sync error:', error);
      }
    };

    syncUser();
  }, [isUserLoaded, user, getToken]);
}
