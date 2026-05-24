import { motion } from 'motion/react';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { cn } from '../../lib/utils';
import { MOCK_MY_CAPSULES, FILTER_TABS } from './constants';
import { CapsuleCard } from './CapsuleCard';

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

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {MOCK_MY_CAPSULES.map((capsule, idx) => (
          <CapsuleCard key={capsule.id} capsule={capsule} index={idx} />
        ))}
      </div>
    </motion.div>
  );
}
