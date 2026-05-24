import { motion, AnimatePresence } from 'motion/react';
import { X, Upload, Lock, MapPin } from 'lucide-react';
import { cn } from '../../lib/utils';
import { CREATE_CAPSULE_STEPS } from './constants';

interface CreateCapsuleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateCapsuleModal({ isOpen, onClose }: CreateCapsuleModalProps) {
  const ACTIVE_STEP = 1;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/40" onClick={onClose} />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 12 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="relative bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-black/5 shadow-xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-3">
              <h2 className="text-lg font-semibold tracking-tight text-ink">Create New Capsule</h2>
              <button
                id="modal-close"
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-ink-muted hover:text-ink hover:bg-paper transition-colors duration-150"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Steps */}
            <div className="px-6 pb-5">
              <div className="flex items-center gap-2">
                {CREATE_CAPSULE_STEPS.map((step, idx) => (
                  <div key={step.number} className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5">
                      <div
                        className={cn(
                          "w-7 h-7 rounded-lg flex items-center justify-center text-xs font-semibold",
                          step.number === ACTIVE_STEP
                            ? "bg-brand text-white"
                            : step.number < ACTIVE_STEP
                              ? "bg-brand-soft text-brand"
                              : "bg-paper text-ink-muted border border-black/5"
                        )}
                      >
                        {step.number}
                      </div>
                      <span
                        className={cn(
                          "text-xs font-medium hidden sm:block",
                          step.number === ACTIVE_STEP ? "text-ink" : "text-ink-muted"
                        )}
                      >
                        {step.label}
                      </span>
                    </div>
                    {idx < CREATE_CAPSULE_STEPS.length - 1 && (
                      <div className="w-6 h-px bg-black/8" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Form */}
            <div className="px-6 pb-5 space-y-4">
              <div>
                <label className="text-[11px] uppercase font-semibold tracking-wider text-ink-muted mb-1.5 block">
                  Capsule Title
                </label>
                <input
                  type="text"
                  placeholder="e.g., Letter to Future Me"
                  className="w-full px-4 py-2.5 rounded-xl border border-black/5 bg-paper text-sm text-ink placeholder:text-ink-muted/50 focus:outline-none focus:border-brand/20 transition-colors"
                />
              </div>
              <div>
                <label className="text-[11px] uppercase font-semibold tracking-wider text-ink-muted mb-1.5 block">
                  Message
                </label>
                <textarea
                  rows={3}
                  placeholder="Write your message to the future..."
                  className="w-full px-4 py-2.5 rounded-xl border border-black/5 bg-paper text-sm text-ink placeholder:text-ink-muted/50 focus:outline-none focus:border-brand/20 transition-colors resize-none"
                />
              </div>
              <div>
                <label className="text-[11px] uppercase font-semibold tracking-wider text-ink-muted mb-1.5 block">
                  Recipient Email
                </label>
                <input
                  type="email"
                  placeholder="Who should receive this?"
                  className="w-full px-4 py-2.5 rounded-xl border border-black/5 bg-paper text-sm text-ink placeholder:text-ink-muted/50 focus:outline-none focus:border-brand/20 transition-colors"
                />
              </div>
            </div>

            {/* Upload */}
            <div className="px-6 pb-5">
              <label className="text-[11px] uppercase font-semibold tracking-wider text-ink-muted mb-1.5 block">
                Memories & Media
              </label>
              <div className="border-2 border-dashed border-black/8 rounded-xl p-6 flex flex-col items-center justify-center text-center hover:border-brand/15 transition-colors duration-200">
                <div className="w-10 h-10 rounded-xl bg-brand-soft flex items-center justify-center text-brand mb-2">
                  <Upload className="w-4 h-4" />
                </div>
                <p className="text-sm font-medium text-ink">Drag and drop files here</p>
                <p className="text-xs text-ink-muted mt-0.5">or click to upload</p>
              </div>
            </div>

            {/* Unlock Conditions */}
            <div className="px-6 pb-5 space-y-2.5">
              <label className="text-[11px] uppercase font-semibold tracking-wider text-ink-muted mb-1.5 block">
                Unlock Conditions
              </label>

              <div className="border border-brand/15 bg-brand-soft/40 rounded-xl p-4 relative">
                <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-brand" />
                <div className="flex gap-3 items-start">
                  <div className="w-9 h-9 rounded-xl bg-white shadow-sm flex items-center justify-center text-brand shrink-0">
                    <Lock className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-ink">Time-Based Lock</h4>
                    <p className="text-xs text-ink-muted mt-0.5">Unlocks automatically on a specific date.</p>
                  </div>
                </div>
              </div>

              <div className="border border-black/5 rounded-xl p-4 opacity-50">
                <div className="flex gap-3 items-start">
                  <div className="w-9 h-9 rounded-xl bg-paper border border-black/5 flex items-center justify-center text-ink-muted shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-ink">Location-Based Lock</h4>
                    <p className="text-xs text-ink-muted mt-0.5">Recipient must arrive at a specific location.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 pb-6 pt-1 flex items-center justify-end gap-2.5">
              <button
                onClick={onClose}
                className="px-5 py-2 text-ink-muted border border-black/5 rounded-xl text-sm font-medium hover:border-black/10 hover:text-ink transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                id="modal-seal-capsule"
                className="px-5 py-2 bg-brand text-white rounded-xl text-sm font-medium hover:bg-brand-light active:scale-[0.98] transition-all duration-200 shadow-sm"
              >
                Seal Capsule
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
