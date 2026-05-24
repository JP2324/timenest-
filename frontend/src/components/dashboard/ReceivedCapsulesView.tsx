import { motion } from 'motion/react';
import { useState } from 'react';
import { cn } from '../../lib/utils';
import { MOCK_RECEIVED_CAPSULES, FILTER_TABS } from './constants';
import { CapsuleCard } from './CapsuleCard';

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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {MOCK_RECEIVED_CAPSULES.map((capsule, idx) => (
          <CapsuleCard
            key={capsule.id}
            capsule={capsule}
            index={idx}
            receivedMode
          />
        ))}
      </div>
    </motion.div>
  );
}
