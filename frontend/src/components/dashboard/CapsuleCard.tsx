import { motion } from 'motion/react';
import { LockKeyhole, LockOpen, Eye } from 'lucide-react';
import type { Key } from 'react';
import { cn } from '../../lib/utils';
import type { Capsule } from './types';

interface CapsuleCardProps {
  key?: Key;
  capsule: Capsule;
  index: number;
  receivedMode?: boolean;
  onView?: (capsuleId: string) => void;
}

/**
 * Determines if a capsule is currently locked based on its
 * unlock date compared to the current time.
 */
const isCapsuleTimeLocked = (capsule: Capsule): boolean => {
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

export function CapsuleCard({ capsule, index, receivedMode = false, onView }: CapsuleCardProps) {
  const timeLocked = isCapsuleTimeLocked(capsule);
  const StatusIcon = timeLocked ? LockKeyhole : LockOpen;

  const handleView = () => {
    if (timeLocked) return;
    onView?.(capsule._id);
  };

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
        <div className="w-10 h-10 rounded-xl bg-brand-soft flex items-center justify-center text-brand">
          <StatusIcon className="w-[18px] h-[18px]" />
        </div>
        <span
          className={cn(
            "inline-flex items-center px-2.5 py-0.5 rounded-lg text-[11px] font-semibold",
            timeLocked
              ? "bg-brand-soft text-brand"
              : "bg-emerald-50 text-emerald-600"
          )}
        >
          {timeLocked ? 'Locked' : 'Unlocked'}
        </span>
      </div>

      {/* Info */}
      <h3 className="text-sm font-semibold tracking-tight text-ink mb-1">{capsule.title}</h3>
      {receivedMode && capsule.creator && (
        <p className="text-xs text-ink-muted mb-0.5">From someone special</p>
      )}
      <p className="text-xs text-ink-muted">
        {timeLocked
          ? `Unlocks: ${capsule.unlockDate ? formatCapsuleDate(capsule.unlockDate) : 'Unknown'}`
          : `Unlocked: ${capsule.unlockDate ? formatCapsuleDate(capsule.unlockDate) : 'Unknown'}`}
      </p>

      {/* Media count indicator */}
      {capsule.mediaUrls.length > 0 && (
        <p className="text-[10px] text-ink-muted mt-1.5">
          📎 {capsule.mediaUrls.length} {capsule.mediaUrls.length === 1 ? 'file' : 'files'} attached
        </p>
      )}

      {/* View Action */}
      <div className="mt-auto pt-4 flex items-center gap-1.5">
        <button
          onClick={handleView}
          disabled={timeLocked}
          className={cn(
            "flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors duration-200",
            timeLocked
              ? "text-ink-muted bg-paper cursor-not-allowed opacity-50"
              : "text-ink bg-paper hover:bg-black/5"
          )}
        >
          <Eye className="w-3.5 h-3.5" />
          {timeLocked ? 'Locked' : 'View'}
        </button>
      </div>
    </motion.div>
  );
}

