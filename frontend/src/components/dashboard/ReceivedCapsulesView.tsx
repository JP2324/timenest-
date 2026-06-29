import { motion } from 'motion/react';
import { useState } from 'react';
import { Mail } from 'lucide-react';
import { cn } from '../../lib/utils';
import { FILTER_TABS } from './constants';
import { CapsuleCard } from './CapsuleCard';
import type { Capsule } from './types';

interface ReceivedCapsulesViewProps {
  onViewCapsule: (capsuleId: string) => void;
  capsules: Capsule[];
  isLoading: boolean;
  onRefetch?: () => void;
}

export function ReceivedCapsulesView({ onViewCapsule, capsules, isLoading, onRefetch }: ReceivedCapsulesViewProps) {
  const [activeFilter, setActiveFilter] = useState<string>('All');

  const filteredCapsules = capsules.filter((capsule) => {
    if (activeFilter === 'All') return true;

    const isTimeLocked = capsule.unlockDate
      ? new Date(capsule.unlockDate) > new Date()
      : capsule.status === 'locked';

    if (activeFilter === 'Locked') return isTimeLocked;
    if (activeFilter === 'Unlocked') return !isTimeLocked;
    return true;
  });

  return (
    <motion.div
      key="received"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-ink">Received Capsules</h2>
        <p className="text-sm text-ink-muted mt-1">Capsules shared with you by others</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto flex-nowrap bg-paper rounded-xl p-1 w-fit border border-black/5">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab}
            id={`received-filter-${tab.toLowerCase()}`}
            onClick={() => setActiveFilter(tab)}
            className={cn(
              "px-4 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 whitespace-nowrap",
              activeFilter === tab
                ? "bg-white text-ink shadow-sm"
                : "text-ink-muted hover:text-ink"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 border-2 border-brand/20 border-t-brand rounded-full animate-spin" />
        </div>
      )}

      {/* Capsules Grid */}
      {!isLoading && filteredCapsules.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCapsules.map((capsule, index) => (
            <CapsuleCard key={capsule._id} capsule={capsule} index={index} receivedMode onView={onViewCapsule} onLocationVerified={onRefetch} />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredCapsules.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.06, duration: 0.35 }}
          className="bg-white border border-black/5 rounded-2xl p-8 flex flex-col items-center justify-center text-center"
        >
          <div className="w-12 h-12 rounded-2xl bg-brand-soft flex items-center justify-center text-brand mb-4">
            <Mail className="w-5 h-5" />
          </div>
          <h3 className="text-base font-semibold tracking-tight text-ink">
            {activeFilter === 'All' ? 'No received capsules yet' : `No ${activeFilter.toLowerCase()} capsules`}
          </h3>
          <p className="text-sm text-ink-muted mt-1 max-w-xs">
            When someone shares a time capsule with you, it will appear here.
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}
