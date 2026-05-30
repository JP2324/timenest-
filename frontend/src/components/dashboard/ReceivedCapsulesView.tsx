import { motion } from 'motion/react';
import { useState } from 'react';
import { Mail } from 'lucide-react';
import { cn } from '../../lib/utils';
import { FILTER_TABS } from './constants';

export function ReceivedCapsulesView() {
  const [activeFilter, setActiveFilter] = useState<string>('All');

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

      {/* Empty State */}
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
          No received capsules yet
        </h3>
        <p className="text-sm text-ink-muted mt-1 max-w-xs">
          When someone shares a time capsule with you, it will appear here.
        </p>
      </motion.div>
    </motion.div>
  );
}

