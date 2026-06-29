import React from 'react';
import { motion } from 'motion/react';
import { Plus, Archive, LockKeyhole, LockOpen } from 'lucide-react';
import { CapsuleCard } from './CapsuleCard';
import type { Capsule } from './types';

interface OverviewViewProps {
  onCreateCapsule: () => void;
  onViewCapsule: (capsuleId: string) => void;
  myCapsules: Capsule[];
  receivedCapsules: Capsule[];
  isLoading: boolean;
  onRefetch?: () => void;
}

interface StatCardProps {
  label: string;
  value: number;
  icon: React.ElementType;
  delay: number;
}

function StatCard({ label, value, icon: Icon, delay }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35 }}
      className="bg-white border border-black/5 rounded-2xl p-5"
    >
      <div className="flex items-center gap-3 mb-2">
        <div className="w-9 h-9 rounded-xl bg-brand-soft flex items-center justify-center text-brand">
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <p className="text-2xl font-semibold tracking-tight text-ink">{value}</p>
      <p className="text-xs text-ink-muted mt-0.5">{label}</p>
    </motion.div>
  );
}

export function OverviewView({ onCreateCapsule, onViewCapsule, myCapsules, receivedCapsules, isLoading, onRefetch }: OverviewViewProps) {
  const allCapsules = [...myCapsules, ...receivedCapsules];

  const totalCount = allCapsules.length;
  const lockedCount = allCapsules.filter((c) => {
    if (c.capsuleType === 'location') return c.status === 'locked';
    if (!c.unlockDate) return c.status === 'locked';
    return new Date(c.unlockDate) > new Date();
  }).length;
  const unlockedCount = totalCount - lockedCount;

  // Show the 4 most recent capsules across both created & received
  const recentCapsules = allCapsules
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 4);

  return (
    <motion.div
      key="overview"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Welcome + CTA row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-ink">
            Welcome back 👋
          </h2>
          <p className="text-sm text-ink-muted mt-1">
            Your memories are safely sealed. Here's your overview.
          </p>
        </div>
        <button
          id="overview-create-capsule"
          onClick={onCreateCapsule}
          className="flex items-center gap-2 px-5 py-2.5 bg-brand text-white rounded-xl text-sm font-medium hover:bg-brand-light active:scale-[0.98] transition-all duration-200 shrink-0 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Create Capsule
        </button>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 border-2 border-brand/20 border-t-brand rounded-full animate-spin" />
        </div>
      )}

      {/* Stats Grid */}
      {!isLoading && totalCount > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard label="Total Capsules" value={totalCount} icon={Archive} delay={0.04} />
          <StatCard label="Locked" value={lockedCount} icon={LockKeyhole} delay={0.08} />
          <StatCard label="Unlocked" value={unlockedCount} icon={LockOpen} delay={0.12} />
        </div>
      )}

      {/* Recent Capsules */}
      {!isLoading && recentCapsules.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-ink-muted mb-3">Recent Capsules</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {recentCapsules.map((capsule, index) => (
              <CapsuleCard key={capsule._id} capsule={capsule} index={index} onView={onViewCapsule} onLocationVerified={onRefetch} />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && totalCount === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.06, duration: 0.35 }}
          className="bg-white border border-black/5 rounded-2xl p-8 flex flex-col items-center justify-center text-center"
        >
          <div className="w-12 h-12 rounded-2xl bg-brand-soft flex items-center justify-center text-brand mb-4">
            <Archive className="w-5 h-5" />
          </div>
          <h3 className="text-base font-semibold tracking-tight text-ink">
            No capsules yet
          </h3>
          <p className="text-sm text-ink-muted mt-1 max-w-xs">
            Create your first time capsule to preserve a memory for the future.
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}
