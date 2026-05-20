import { motion } from 'motion/react';
import { Plus } from 'lucide-react';
import { MOCK_STATS, MOCK_RECENT_CAPSULES } from './constants';
import { CapsuleCard } from './CapsuleCard';

interface OverviewViewProps {
  onCreateCapsule: () => void;
}

export function OverviewView({ onCreateCapsule }: OverviewViewProps) {
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

      {/* Stats — 3 cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {MOCK_STATS.map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.06, duration: 0.35 }}
            className="bg-white border border-black/5 rounded-2xl p-5"
          >
            <div className="w-9 h-9 rounded-xl bg-brand-soft flex items-center justify-center text-brand mb-4">
              <stat.icon className="w-4 h-4" />
            </div>
            <p className="text-2xl font-semibold tracking-tight text-ink">{stat.value}</p>
            <p className="text-xs text-ink-muted mt-0.5">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Recent Capsules */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold tracking-tight text-ink">Recent Capsules</h3>
          <span className="text-xs text-ink-muted">Showing latest</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {MOCK_RECENT_CAPSULES.map((capsule, idx) => (
            <CapsuleCard key={capsule.id} capsule={capsule} index={idx} />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
