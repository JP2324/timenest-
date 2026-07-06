import { useState } from 'react';
import { motion } from 'motion/react';
import { LockKeyhole, LockOpen, Eye, MapPin, Loader2 } from 'lucide-react';
import { useAuth } from '@clerk/clerk-react';
import type { Key } from 'react';
import { cn } from '../../lib/utils';
import { LocationMapModal } from './LocationMapModal';
import type { Capsule } from './types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// ── Types ─────────────────────────────────────────────────────────────────────

interface CapsuleCardProps {
  key?: Key;
  capsule: Capsule;
  index: number;
  receivedMode?: boolean;
  onView?: (capsuleId: string) => void;
  onLocationVerified?: () => void;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Determines if a capsule is currently locked based on its
 * type and unlock conditions.
 */
const isCapsuleLocked = (capsule: Capsule): boolean => {
  // Location capsules are locked until explicitly verified
  if (capsule.capsuleType === 'location') {
    return capsule.status === 'locked';
  }

  // Time-based capsules check the unlock date
  if (!capsule.unlockDate) return capsule.status === 'locked';
  return new Date(capsule.unlockDate) > new Date();
};

/**
 * Formats a date string into a human-friendly display.
 */
const formatCapsuleDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

/** Entrance animation using spring physics for organic feel */
const CARD_ENTRANCE_VARIANTS = {
  hidden: { opacity: 0, y: 16 },
  visible: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: index * 0.05,
      type: 'spring',
      stiffness: 300,
      damping: 25,
    },
  }),
};

// ── Component ─────────────────────────────────────────────────────────────────

export function CapsuleCard({ capsule, index, receivedMode = false, onView, onLocationVerified }: CapsuleCardProps) {
  const { getToken } = useAuth();
  const locked = isCapsuleLocked(capsule);
  const isLocationCapsule = capsule.capsuleType === 'location';

  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState('');
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);

  // Choose the appropriate status icon
  const StatusIcon = isLocationCapsule ? MapPin : (locked ? LockKeyhole : LockOpen);

  const handleView = () => {
    if (locked) return;
    onView?.(capsule._id);
  };

  // ── Location Verification ──────────────────────────────────────────────────

  const handleVerifyLocation = async () => {
    setVerifyError('');
    setIsVerifying(true);

    // Step 1: Request browser geolocation
    if (!navigator.geolocation) {
      setVerifyError('Geolocation is not supported by your browser.');
      setIsVerifying(false);
      return;
    }

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0,
        });
      });

      const { latitude, longitude } = position.coords;

      // Step 2: Send coordinates to the backend for verification
      const token = await getToken();
      const response = await fetch(`${API_BASE_URL}/capsules/${capsule._id}/verify-location`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ latitude, longitude }),
      });

      const data = await response.json();

      if (data.success) {
        // Verification passed — trigger refetch and navigate to capsule
        onLocationVerified?.();
        onView?.(capsule._id);
      } else {
        setVerifyError(data.message || 'You are not at the correct location.');
      }
    } catch (error) {
      if (error instanceof GeolocationPositionError) {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setVerifyError('Location access denied. Please allow location access in your browser settings.');
            break;
          case error.POSITION_UNAVAILABLE:
            setVerifyError('Location information is unavailable. Please try again.');
            break;
          case error.TIMEOUT:
            setVerifyError('Location request timed out. Please try again.');
            break;
          default:
            setVerifyError('Failed to get your location. Please try again.');
        }
      } else {
        setVerifyError('Something went wrong. Please try again.');
      }
    } finally {
      setIsVerifying(false);
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <motion.div
      variants={CARD_ENTRANCE_VARIANTS}
      initial="hidden"
      animate="visible"
      custom={index}
      className="bg-white border border-black/5 rounded-2xl p-5 flex flex-col capsule-card"
    >
      {/* Top row */}
      <div className="flex items-start justify-between mb-3">
        <div className={cn(
          "w-10 h-10 rounded-xl flex items-center justify-center",
          isLocationCapsule ? "bg-amber-50 text-amber-600" : "bg-brand-soft text-brand"
        )}>
          <StatusIcon className="w-[18px] h-[18px]" />
        </div>
        <span
          className={cn(
            "inline-flex items-center px-2.5 py-0.5 rounded-lg text-[11px] font-semibold",
            locked
              ? isLocationCapsule
                ? "bg-amber-50 text-amber-600"
                : "bg-brand-soft text-brand"
              : "bg-emerald-50 text-emerald-600"
          )}
        >
          {locked
            ? isLocationCapsule ? '📍 Location Locked' : 'Locked'
            : 'Unlocked'}
        </span>
      </div>

      {/* Info */}
      <h3 className="text-sm font-semibold tracking-tight text-ink mb-1">{capsule.title}</h3>
      {receivedMode && capsule.creator && (
        <p className="text-xs text-ink-muted mb-0.5">From someone special</p>
      )}
      <p className="text-xs text-ink-muted">
        {isLocationCapsule
          ? locked
            ? 'Verify your location to unlock'
            : `Unlocked: ${capsule.openedAt ? formatCapsuleDate(capsule.openedAt) : 'Now'}`
          : locked
            ? `Unlocks: ${capsule.unlockDate ? formatCapsuleDate(capsule.unlockDate) : 'Unknown'}`
            : `Unlocked: ${capsule.unlockDate ? formatCapsuleDate(capsule.unlockDate) : 'Unknown'}`}
      </p>

      {/* Media count indicator */}
      {capsule.mediaUrls.length > 0 && (
        <p className="text-[10px] text-ink-muted mt-1.5">
          📎 {capsule.mediaUrls.length} {capsule.mediaUrls.length === 1 ? 'file' : 'files'} attached
        </p>
      )}

      {/* Verification error */}
      {verifyError && (
        <p className="text-[11px] text-red-500 font-medium mt-2 leading-snug">{verifyError}</p>
      )}

      {/* Action Buttons */}
      <div className="mt-auto pt-4 flex items-center gap-1.5">
        {isLocationCapsule && locked ? (
          /* Verify + View Location buttons for locked location capsules */
          <>
            <button
              id={`verify-location-${capsule._id}`}
              onClick={handleVerifyLocation}
              disabled={isVerifying}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200",
                isVerifying
                  ? "text-ink-muted bg-paper cursor-not-allowed"
                  : "text-white bg-brand hover:bg-brand-light active:scale-[0.98]"
              )}
            >
              {isVerifying ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Verifying…
                </>
              ) : (
                <>
                  <MapPin className="w-3.5 h-3.5" />
                  Verify Location
                </>
              )}
            </button>
            {capsule.unlockLocation && (
              <button
                id={`view-location-${capsule._id}`}
                onClick={() => setIsMapModalOpen(true)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-ink bg-paper hover:bg-black/5 transition-colors duration-200"
              >
                <Eye className="w-3.5 h-3.5" />
                View Location
              </button>
            )}
          </>
        ) : (
          /* Standard View button */
          <button
            onClick={handleView}
            disabled={locked}
            className={cn(
              "flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors duration-200",
              locked
                ? "text-ink-muted bg-paper cursor-not-allowed opacity-50"
                : "text-ink bg-paper hover:bg-black/5"
            )}
          >
            <Eye className="w-3.5 h-3.5" />
            {locked ? 'Locked' : 'View'}
          </button>
        )}
      </div>

      {/* Location Map Modal */}
      {isLocationCapsule && capsule.unlockLocation && (
        <LocationMapModal
          isOpen={isMapModalOpen}
          onClose={() => setIsMapModalOpen(false)}
          latitude={capsule.unlockLocation.latitude}
          longitude={capsule.unlockLocation.longitude}
          radius={capsule.unlockLocation.radius}
          locationName={capsule.unlockLocation.locationName}
        />
      )}
    </motion.div>
  );
}
