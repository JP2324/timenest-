import { motion } from 'motion/react';
import { Plus, Archive } from 'lucide-react';

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

      {/* Empty State */}
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
    </motion.div>
  );
}

