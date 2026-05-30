import { motion } from 'motion/react';
import { LockKeyhole, LockOpen, Eye, Pencil, Trash2 } from 'lucide-react';
import type { Key } from 'react';
import { cn } from '../../lib/utils';
import type { CapsuleStatus } from './types';

interface CapsuleCardData {
  id: string;
  title: string;
  status: CapsuleStatus;
  unlockDate: string;
  sender?: string;
}

interface CapsuleCardProps {
  key?: Key;
  capsule: CapsuleCardData;
  index: number;
  showActions?: boolean;
  receivedMode?: boolean;
}

export function CapsuleCard({ capsule, index, showActions = true, receivedMode = false }: CapsuleCardProps) {
  const isLocked = capsule.status === 'locked';
  const StatusIcon = isLocked ? LockKeyhole : LockOpen;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.35 }}
      className="bg-white border border-black/5 rounded-2xl p-5 hover:shadow-md hover:border-black/8 transition-all duration-200 flex flex-col"
    >
      {/* Top row */}
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-xl bg-brand-soft flex items-center justify-center text-brand">
          <StatusIcon className="w-[18px] h-[18px]" />
        </div>
        <span
          className={cn(
            "inline-flex items-center px-2.5 py-0.5 rounded-lg text-[11px] font-semibold",
            isLocked
              ? "bg-brand-soft text-brand"
              : "bg-emerald-50 text-emerald-600"
          )}
        >
          {isLocked ? 'Locked' : 'Unlocked'}
        </span>
      </div>

      {/* Info */}
      <h3 className="text-sm font-semibold tracking-tight text-ink mb-1">{capsule.title}</h3>
      {capsule.sender && (
        <p className="text-xs text-ink-muted mb-0.5">From: {capsule.sender}</p>
      )}
      <p className="text-xs text-ink-muted">
        {isLocked ? `Unlocks: ${capsule.unlockDate}` : `Opened: ${capsule.unlockDate}`}
      </p>

      {/* Actions */}
      <div className="mt-auto pt-4 flex items-center gap-1.5">
        <button
          className={cn(
            "flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors duration-200",
            isLocked && receivedMode
              ? "text-ink-muted bg-paper"
              : "text-ink bg-paper hover:bg-black/5"
          )}
        >
          <Eye className="w-3.5 h-3.5" />
          View
        </button>

        {showActions && !receivedMode && (
          <>
            <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-ink-muted bg-paper hover:bg-black/5 transition-colors duration-200">
              <Pencil className="w-3.5 h-3.5" />
              Edit
            </button>
            <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-red-400 bg-paper hover:bg-red-50 transition-colors duration-200">
              <Trash2 className="w-3.5 h-3.5" />
              Delete
            </button>
          </>
        )}
      </div>
    </motion.div>
  );
}
