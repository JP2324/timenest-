import { motion } from 'motion/react';
import { Lock, FileText, Image as ImageIcon, MapPin, Send, History } from 'lucide-react';
import { cn } from '../lib/utils';
import { useState } from 'react';

export function InteractivePreview() {
  const [activeTab, setActiveTab] = useState<'details' | 'media' | 'delivery'>('delivery');

  return (
    <div className="relative w-full max-w-4xl mx-auto mt-24 md:mt-32">
      {/* Decorative background blob */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-brand-soft blur-[100px] rounded-full -z-10 pointer-events-none" />

      <motion.div 
        initial={{ y: 40, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="bg-surface backdrop-blur-2xl border border-black/5 rounded-[2.5rem] md:rounded-[3rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] overflow-hidden relative flex flex-col md:flex-row"
      >
        {/* Sidebar */}
        <div className="w-full md:w-72 bg-[#FBFBFB] p-6 md:p-8 border-b md:border-b-0 md:border-r border-black/5">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-full bg-brand-soft border border-brand/10 flex items-center justify-center text-brand">
              <History className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-semibold tracking-wider text-ink-muted uppercase">New Capsule</div>
              <div className="font-medium text-sm text-ink mt-0.5">To Future Self</div>
            </div>
          </div>

          <div className="space-y-2">
            {[
              { id: 'details', icon: FileText, label: 'Message Details' },
              { id: 'media', icon: ImageIcon, label: 'Memories & Media' },
              { id: 'delivery', icon: Lock, label: 'Unlock Conditions' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-[13px] font-medium transition-all border",
                  activeTab === tab.id 
                    ? "bg-white text-ink border-black/5 shadow-sm" 
                    : "border-transparent text-ink-muted hover:bg-black/5 hover:text-ink"
                )}
              >
                <tab.icon className={cn("w-4 h-4", activeTab === tab.id ? "text-brand" : "")} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content Pane */}
        <div className="flex-1 p-6 md:p-10 bg-white">
          <AnimateTabContent activeTab={activeTab} />
        </div>
      </motion.div>
    </div>
  );
}

function AnimateTabContent({ activeTab }: { activeTab: string }) {
  if (activeTab !== 'delivery') {
    return (
      <motion.div 
        key={activeTab}
        initial={{ opacity: 0, x: 10 }}
        animate={{ opacity: 1, x: 0 }}
        className="h-full flex flex-col justify-center items-center text-center space-y-4 py-12 text-ink-muted"
      >
        <div className="w-16 h-16 rounded-[1.5rem] bg-paper flex items-center justify-center border border-black/5">
          {activeTab === 'details' ? <FileText className="w-6 h-6 text-brand/70" /> : <ImageIcon className="w-6 h-6 text-brand/70" />}
        </div>
        <p className="text-[13px] max-w-[200px] leading-relaxed">
          {activeTab === 'details' 
            ? "Write your letter to the future, securely encrypted."
            : "Upload photos, videos, and documents to preserve."}
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div 
      key="delivery"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-8"
    >
      <div className="space-y-2 mb-8 text-center md:text-left">
        <h3 className="text-xl md:text-2xl font-semibold tracking-tight text-ink">Set Unlock Conditions</h3>
        <p className="text-[13px] text-ink-muted">Determine when and how this capsule will be opened.</p>
      </div>

      <div className="space-y-4">
        {/* Date Condition Box */}
        <div className="relative overflow-hidden group cursor-pointer border-2 border-brand/20 bg-brand-soft/50 rounded-3xl p-5 md:p-6 hover:border-brand/40 transition-colors">
          <div className="absolute top-5 right-5 w-2.5 h-2.5 rounded-full bg-brand " />
          <div className="flex gap-4 items-start">
            <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-brand shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-base font-semibold text-ink">Time-Based Lock</h4>
              <p className="text-[13px] text-ink-muted mt-1 mb-5 leading-relaxed">Unlocks automatically on a specific date in the future.</p>
              
              <div className="inline-flex items-center gap-4 bg-white px-5 py-3 rounded-2xl shadow-sm border border-black/5 text-[13px]">
                <span className="text-brand font-medium">Unlock Date</span>
                <span className="font-medium text-ink">May 15, 2030</span>
              </div>
            </div>
          </div>
        </div>

        {/* Location Condition Box */}
        <div className="relative group cursor-pointer border border-black/5 rounded-3xl p-5 md:p-6 hover:border-black/10 hover:bg-paper transition-colors">
          <div className="absolute top-5 right-5 w-2.5 h-2.5 rounded-full bg-black/10 group-hover:bg-brand/50 transition-colors" />
          <div className="flex gap-4 items-start opacity-70 group-hover:opacity-100 transition-opacity">
            <div className="w-12 h-12 rounded-2xl bg-paper border border-black/5 flex items-center justify-center text-ink shrink-0 group-hover:bg-white group-hover:text-brand group-hover:shadow-sm transition-all">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-base font-semibold text-ink">Location-Based Lock</h4>
              <p className="text-[13px] text-ink-muted mt-1 leading-relaxed">Recipient must arrive at a specific geographic coordinate.</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="pt-6 flex justify-end">
        <button className="flex items-center justify-center w-full md:w-auto gap-2 bg-ink text-white px-8 py-3.5 rounded-full text-sm font-medium hover:bg-black transition-all hover:scale-105 active:scale-95 shadow-[0_8px_20px_rgba(0,0,0,0.15)]">
          Seal Capsule <Send className="w-4 h-4 ml-1" />
        </button>
      </div>

    </motion.div>
  );
}
