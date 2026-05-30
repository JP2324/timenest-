import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/clerk-react';
import type { Capsule } from '../components/dashboard/types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface UseCapsuleReturn {
  myCapsules: Capsule[];
  receivedCapsules: Capsule[];
  isLoading: boolean;
  refetch: () => void;
  /** Count of received capsules whose unlockDate has passed (newly openable) */
  unlockedNotificationCount: number;
}

/**
 * Fetches the authenticated user's created and received capsules.
 * Provides a refetch callback for use after capsule creation.
 */
export function useCapsules(): UseCapsuleReturn {
  const { getToken } = useAuth();
  const [myCapsules, setMyCapsules] = useState<Capsule[]>([]);
  const [receivedCapsules, setReceivedCapsules] = useState<Capsule[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCapsules = useCallback(async () => {
    try {
      const token = await getToken();
      const headers = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      };

      const [mineRes, receivedRes] = await Promise.all([
        fetch(`${API_BASE_URL}/capsules/mine`, { headers }),
        fetch(`${API_BASE_URL}/capsules/received`, { headers }),
      ]);

      if (mineRes.ok) {
        const mineData = await mineRes.json();
        setMyCapsules(mineData.capsules || []);
      }

      if (receivedRes.ok) {
        const receivedData = await receivedRes.json();
        setReceivedCapsules(receivedData.capsules || []);
      }
    } catch (error) {
      console.error('Failed to fetch capsules:', error);
    } finally {
      setIsLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    fetchCapsules();
  }, [fetchCapsules]);

  const unlockedNotificationCount = receivedCapsules.filter((capsule) => {
    if (!capsule.unlockDate) return false;
    return new Date(capsule.unlockDate) <= new Date() && capsule.status === 'locked';
  }).length;

  return {
    myCapsules,
    receivedCapsules,
    isLoading,
    refetch: fetchCapsules,
    unlockedNotificationCount,
  };
}
