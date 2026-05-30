import { motion } from 'motion/react';
import { Plus, Archive } from 'lucide-react';
import { useState } from 'react';
import { cn } from '../../lib/utils';
import { FILTER_TABS } from './constants';

interface MyCapsulesViewProps {
  onCreateCapsule: () => void;
}

export function MyCapsulesView({ onCreateCapsule }: MyCapsulesViewProps) {
  const [activeFilter, setActiveFilter] = useState<string>('All');

  return (
    <motion.div
      key="my-capsules"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-ink">My Capsules</h2>
          <p className="text-sm text-ink-muted mt-1">All the time capsules you've created</p>
        </div>
        <button
          id="my-capsules-create"
          onClick={onCreateCapsule}
          className="flex items-center gap-2 px-5 py-2.5 bg-ink text-white rounded-xl text-sm font-medium hover:bg-black active:scale-[0.98] transition-all duration-200 shadow-sm shrink-0"
        >
          <Plus className="w-4 h-4" />
          Create Capsule
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-1.5 bg-paper rounded-xl p-1 w-fit border border-black/5">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab}
            id={`filter-${tab.toLowerCase()}`}
            onClick={() => setActiveFilter(tab)}
            className={cn(
              "px-4 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200",
              activeFilter === tab
                ? "bg-white text-ink shadow-sm"
                : "text-ink-muted hover:text-ink"
            )}
          >
            {tab}
          </button>
        ))}
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
          Your created capsules will appear here once you seal your first one.
        </p>
      </motion.div>
    </motion.div>
  );
}

