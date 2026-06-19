import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Upload, Lock, MapPin, Users, Clock, FileText, Trash2, ChevronLeft, ChevronRight, Loader2, Plus } from 'lucide-react';
import { useAuth } from '@clerk/clerk-react';
import { cn } from '../../lib/utils';
import { CREATE_CAPSULE_STEPS } from './constants';
import type { GroupRecipientEntry } from './types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const MAX_FILE_SIZE_MB = 50;

// ── Types ─────────────────────────────────────────────────────────────────────

interface CreateCapsuleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapsuleCreated?: () => void;
}

interface UploadedFile {
  file: File;
  previewUrl?: string;
}

type CapsuleTypeOption = 'time' | 'location' | 'group';

// ── Component ─────────────────────────────────────────────────────────────────

export function CreateCapsuleModal({ isOpen, onClose, onCapsuleCreated }: CreateCapsuleModalProps) {
  const { getToken } = useAuth();

  // Step tracking
  const [currentStep, setCurrentStep] = useState(1);

  // Phase 1 — Message Details
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [recipientUsername, setRecipientUsername] = useState('');
  const [capsuleType, setCapsuleType] = useState<CapsuleTypeOption>('time');

  // Group Recipients
  const [groupRecipients, setGroupRecipients] = useState<GroupRecipientEntry[]>([]);
  const [groupUsernameInput, setGroupUsernameInput] = useState('');
  const [groupEmailInput, setGroupEmailInput] = useState('');

  // Phase 2 — File Uploads
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Phase 3 — Unlock Date
  const [unlockDate, setUnlockDate] = useState('');

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');

  // ── Helpers ───────────────────────────────────────────────────────────────

  const resetForm = () => {
    setCurrentStep(1);
    setTitle('');
    setMessage('');
    setRecipientEmail('');
    setRecipientUsername('');
    setCapsuleType('time');
    setGroupRecipients([]);
    setGroupUsernameInput('');
    setGroupEmailInput('');
    setUploadedFiles([]);
    setUnlockDate('');
    setError('');
    setIsSubmitting(false);
    setIsUploading(false);
    setIsDragging(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Returns the minimum datetime-local value (now + 1 minute)
  const getMinDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 1);
    return now.toISOString().slice(0, 16);
  };

  // ── Phase 1 Validation ────────────────────────────────────────────────────

  const isPhase1Valid = capsuleType === 'group'
    ? title.trim().length > 0 && groupRecipients.length > 0
    : title.trim().length > 0;

  // ── Group Recipient Helpers ──────────────────────────────────────────────

  const addGroupRecipient = () => {
    const username = groupUsernameInput.trim();
    const email = groupEmailInput.trim();

    if (!username && !email) {
      setError('Please enter a username or email');
      return;
    }

    // Check for duplicates
    const isDuplicate = groupRecipients.some(
      (r) => (username && r.username === username) || (email && r.email === email)
    );

    if (isDuplicate) {
      setError('This recipient has already been added');
      return;
    }

    setGroupRecipients((prev) => [...prev, { username, email }]);
    setGroupUsernameInput('');
    setGroupEmailInput('');
    setError('');
  };

  const removeGroupRecipient = (index: number) => {
    setGroupRecipients((prev) => prev.filter((_, i) => i !== index));
  };

  // ── Phase 2 — File Handling ───────────────────────────────────────────────

  const addFiles = (fileList: FileList | null) => {
    if (!fileList) return;

    const validFiles: UploadedFile[] = [];
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        setError(`File "${file.name}" exceeds ${MAX_FILE_SIZE_MB}MB limit`);
        continue;
      }

      const previewUrl = file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined;
      validFiles.push({ file, previewUrl });
    }

    setUploadedFiles((prev) => [...prev, ...validFiles]);
    setError('');
  };

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => {
      const removed = prev[index];
      if (removed.previewUrl) URL.revokeObjectURL(removed.previewUrl);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    addFiles(e.dataTransfer.files);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  // ── Phase 3 Validation ────────────────────────────────────────────────────

  const isPhase3Valid = unlockDate.length > 0 && new Date(unlockDate) > new Date();

  // ── Upload Files to ImageKit ──────────────────────────────────────────────

  const uploadFilesToServer = async (): Promise<string[]> => {
    if (uploadedFiles.length === 0) return [];

    setIsUploading(true);
    try {
      const token = await getToken();
      const formData = new FormData();
      uploadedFiles.forEach(({ file }) => formData.append('files', file));

      const response = await fetch(`${API_BASE_URL}/capsules/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('File upload failed');
      }

      const data = await response.json();
      return data.urls as string[];
    } finally {
      setIsUploading(false);
    }
  };

  // ── Submit Capsule ────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    if (!isPhase3Valid) {
      setError('Please select a valid future date');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // Step 1: Upload files
      const mediaUrls = await uploadFilesToServer();

      // Step 2: Create capsule
      const token = await getToken();
      const response = await fetch(`${API_BASE_URL}/capsules`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: title.trim(),
          message: message.trim() || undefined,
          ...(capsuleType === 'group'
            ? { groupRecipients }
            : {
                recipientEmail: recipientEmail.trim() || undefined,
                recipientUsername: recipientUsername.trim() || undefined,
              }),
          mediaUrls,
          capsuleType,
          unlockDate: new Date(unlockDate).toISOString(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create capsule');
      }

      onCapsuleCreated?.();
      handleClose();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Something went wrong';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Navigation ────────────────────────────────────────────────────────────

  const goNext = () => {
    if (currentStep === 1 && !isPhase1Valid) {
      setError('Title is required');
      return;
    }
    setError('');
    setCurrentStep((prev) => Math.min(prev + 1, 3));
  };

  const goBack = () => {
    setError('');
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  // ── Capsule Type Options ──────────────────────────────────────────────────

  const capsuleTypeOptions = [
    { id: 'time' as const, icon: Clock, label: 'Normal', description: 'Time-based capsule', enabled: true },
    { id: 'location' as const, icon: MapPin, label: 'Location', description: 'Coming soon', enabled: false },
    { id: 'group' as const, icon: Users, label: 'Group', description: 'Multi-recipient capsule', enabled: true },
  ];

  // ── Render ────────────────────────────────────────────────────────────────

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
          <div className="absolute inset-0 bg-black/40" onClick={handleClose} />

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
                onClick={handleClose}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-ink-muted hover:text-ink hover:bg-paper transition-colors duration-150"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Step Indicators */}
            <div className="px-6 pb-5">
              <div className="flex items-center gap-2">
                {CREATE_CAPSULE_STEPS.map((step, idx) => (
                  <div key={step.number} className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5">
                      <div
                        className={cn(
                          "w-7 h-7 rounded-lg flex items-center justify-center text-xs font-semibold transition-colors duration-200",
                          step.number === currentStep
                            ? "bg-brand text-white"
                            : step.number < currentStep
                              ? "bg-brand-soft text-brand"
                              : "bg-paper text-ink-muted border border-black/5"
                        )}
                      >
                        {step.number}
                      </div>
                      <span
                        className={cn(
                          "text-xs font-medium hidden sm:block transition-colors duration-200",
                          step.number === currentStep ? "text-ink" : "text-ink-muted"
                        )}
                      >
                        {step.label}
                      </span>
                    </div>
                    {idx < CREATE_CAPSULE_STEPS.length - 1 && (
                      <div className={cn(
                        "w-6 h-px transition-colors duration-200",
                        step.number < currentStep ? "bg-brand/30" : "bg-black/8"
                      )} />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Phase Content */}
            <AnimatePresence mode="wait">
              {/* Phase 1: Message Details */}
              {currentStep === 1 && (
                <motion.div
                  key="step-1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="px-6 pb-5 space-y-4"
                >
                  {/* Capsule Type Selector */}
                  <div>
                    <label className="text-[11px] uppercase font-semibold tracking-wider text-ink-muted mb-2 block">
                      Capsule Type
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {capsuleTypeOptions.map((option) => (
                        <button
                          key={option.id}
                          onClick={() => option.enabled && setCapsuleType(option.id)}
                          disabled={!option.enabled}
                          className={cn(
                            "flex flex-col items-center gap-1.5 p-3 rounded-xl border text-center transition-all duration-200",
                            capsuleType === option.id && option.enabled
                              ? "border-brand/20 bg-brand-soft/40"
                              : option.enabled
                                ? "border-black/5 bg-paper hover:border-black/10"
                                : "border-black/5 bg-paper/50 opacity-50 cursor-not-allowed"
                          )}
                        >
                          <option.icon className={cn(
                            "w-4 h-4",
                            capsuleType === option.id && option.enabled ? "text-brand" : "text-ink-muted"
                          )} />
                          <span className={cn(
                            "text-xs font-semibold",
                            capsuleType === option.id && option.enabled ? "text-brand" : "text-ink-muted"
                          )}>
                            {option.label}
                          </span>
                          {!option.enabled && (
                            <span className="text-[9px] text-ink-muted/60 font-medium">Coming Soon</span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] uppercase font-semibold tracking-wider text-ink-muted mb-1.5 block">
                      Capsule Title
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
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
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Write your message to the future..."
                      className="w-full px-4 py-2.5 rounded-xl border border-black/5 bg-paper text-sm text-ink placeholder:text-ink-muted/50 focus:outline-none focus:border-brand/20 transition-colors resize-none"
                    />
                  </div>

                  {/* Recipient Fields — conditional based on capsule type */}
                  {capsuleType === 'group' ? (
                    <div>
                      <label className="text-[11px] uppercase font-semibold tracking-wider text-ink-muted mb-1.5 block">
                        Group Recipients
                      </label>

                      {/* Add Recipient Row */}
                      <div className="flex gap-2 items-end">
                        <div className="flex-1">
                          <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-ink-muted/50 font-medium select-none">@</span>
                            <input
                              type="text"
                              value={groupUsernameInput}
                              onChange={(e) => setGroupUsernameInput(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addGroupRecipient())}
                              placeholder="username"
                              className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-black/5 bg-paper text-sm text-ink placeholder:text-ink-muted/50 focus:outline-none focus:border-brand/20 transition-colors"
                            />
                          </div>
                        </div>
                        <div className="flex-1">
                          <input
                            type="email"
                            value={groupEmailInput}
                            onChange={(e) => setGroupEmailInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addGroupRecipient())}
                            placeholder="or email"
                            className="w-full px-4 py-2.5 rounded-xl border border-black/5 bg-paper text-sm text-ink placeholder:text-ink-muted/50 focus:outline-none focus:border-brand/20 transition-colors"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={addGroupRecipient}
                          className="w-10 h-10 flex items-center justify-center rounded-xl bg-brand text-white hover:bg-brand-light active:scale-95 transition-all duration-200 shrink-0"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Recipient Tags */}
                      {groupRecipients.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2.5">
                          {groupRecipients.map((recipient, index) => (
                            <span
                              key={`${recipient.username || recipient.email}-${index}`}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-brand-soft text-brand text-xs font-medium"
                            >
                              {recipient.username ? `@${recipient.username}` : recipient.email}
                              <button
                                type="button"
                                onClick={() => removeGroupRecipient(index)}
                                className="w-3.5 h-3.5 flex items-center justify-center rounded-full hover:bg-brand/10 transition-colors"
                              >
                                <X className="w-2.5 h-2.5" />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}

                      <p className="text-[10px] text-ink-muted mt-1.5">
                        Add recipients by username or email. At least one is required.
                      </p>
                    </div>
                  ) : (
                    <>
                      <div>
                        <label className="text-[11px] uppercase font-semibold tracking-wider text-ink-muted mb-1.5 block">
                          Recipient Username
                        </label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-ink-muted/50 font-medium select-none">@</span>
                          <input
                            type="text"
                            value={recipientUsername}
                            onChange={(e) => setRecipientUsername(e.target.value)}
                            placeholder="username (optional)"
                            className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-black/5 bg-paper text-sm text-ink placeholder:text-ink-muted/50 focus:outline-none focus:border-brand/20 transition-colors"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[11px] uppercase font-semibold tracking-wider text-ink-muted mb-1.5 block">
                          Recipient Email
                        </label>
                        <input
                          type="email"
                          value={recipientEmail}
                          onChange={(e) => setRecipientEmail(e.target.value)}
                          placeholder="email@example.com (optional)"
                          className="w-full px-4 py-2.5 rounded-xl border border-black/5 bg-paper text-sm text-ink placeholder:text-ink-muted/50 focus:outline-none focus:border-brand/20 transition-colors"
                        />
                      </div>
                    </>
                  )}
                </motion.div>
              )}

              {/* Phase 2: Memories & Media */}
              {currentStep === 2 && (
                <motion.div
                  key="step-2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="px-6 pb-5"
                >
                  <label className="text-[11px] uppercase font-semibold tracking-wider text-ink-muted mb-2 block">
                    Memories & Media
                  </label>

                  {/* Drop Zone */}
                  <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onClick={() => fileInputRef.current?.click()}
                    className={cn(
                      "border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors duration-200",
                      isDragging
                        ? "border-brand/30 bg-brand-soft/30"
                        : "border-black/8 hover:border-brand/15"
                    )}
                  >
                    <div className="w-10 h-10 rounded-xl bg-brand-soft flex items-center justify-center text-brand mb-2">
                      <Upload className="w-4 h-4" />
                    </div>
                    <p className="text-sm font-medium text-ink">Drag and drop files here</p>
                    <p className="text-xs text-ink-muted mt-0.5">or click to upload • Images, videos, PDFs, documents</p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      onChange={(e) => addFiles(e.target.files)}
                      className="hidden"
                      accept="image/*,video/*,.pdf,.doc,.docx,.txt"
                    />
                  </div>

                  {/* Uploaded Files List */}
                  {uploadedFiles.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {uploadedFiles.map((uploadedFile, index) => (
                        <div
                          key={`${uploadedFile.file.name}-${index}`}
                          className="flex items-center gap-3 px-3 py-2.5 bg-paper rounded-xl border border-black/5"
                        >
                          {uploadedFile.previewUrl ? (
                            <img
                              src={uploadedFile.previewUrl}
                              alt={uploadedFile.file.name}
                              className="w-9 h-9 rounded-lg object-cover shrink-0"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-lg bg-brand-soft flex items-center justify-center shrink-0">
                              <FileText className="w-4 h-4 text-brand" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-ink truncate">{uploadedFile.file.name}</p>
                            <p className="text-[10px] text-ink-muted">
                              {(uploadedFile.file.size / (1024 * 1024)).toFixed(1)} MB
                            </p>
                          </div>
                          <button
                            onClick={(e) => { e.stopPropagation(); removeFile(index); }}
                            className="w-7 h-7 flex items-center justify-center rounded-lg text-ink-muted hover:text-red-400 hover:bg-red-50 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {/* Phase 3: Unlock Conditions */}
              {currentStep === 3 && (
                <motion.div
                  key="step-3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="px-6 pb-5 space-y-3"
                >
                  <label className="text-[11px] uppercase font-semibold tracking-wider text-ink-muted mb-1.5 block">
                    Unlock Conditions
                  </label>

                  {/* Time-Based Lock (Active) */}
                  <div className="border border-brand/15 bg-brand-soft/40 rounded-xl p-4 relative">
                    <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-brand" />
                    <div className="flex gap-3 items-start">
                      <div className="w-9 h-9 rounded-xl bg-white shadow-sm flex items-center justify-center text-brand shrink-0">
                        <Lock className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-semibold text-ink">Time-Based Lock</h4>
                        <p className="text-xs text-ink-muted mt-0.5 mb-3">Choose when this capsule unlocks.</p>
                        <input
                          type="datetime-local"
                          value={unlockDate}
                          min={getMinDateTime()}
                          onChange={(e) => setUnlockDate(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-black/10 bg-white text-sm text-ink focus:outline-none focus:border-brand/30 transition-colors"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Location-Based Lock (Disabled) */}
                  <div className="border border-black/5 rounded-xl p-4 opacity-40 cursor-not-allowed">
                    <div className="flex gap-3 items-start">
                      <div className="w-9 h-9 rounded-xl bg-paper border border-black/5 flex items-center justify-center text-ink-muted shrink-0">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-ink">Location-Based Lock</h4>
                        <p className="text-xs text-ink-muted mt-0.5">Coming soon — Recipient must arrive at a specific location.</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error */}
            {error && (
              <div className="px-6 pb-3">
                <p className="text-xs text-red-500 font-medium">{error}</p>
              </div>
            )}

            {/* Footer */}
            <div className="px-6 pb-6 pt-1 flex items-center justify-between">
              <div>
                {currentStep > 1 && (
                  <button
                    onClick={goBack}
                    disabled={isSubmitting}
                    className="flex items-center gap-1 px-4 py-2 text-ink-muted text-sm font-medium hover:text-ink transition-colors duration-200"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    Back
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="px-5 py-2 text-ink-muted border border-black/5 rounded-xl text-sm font-medium hover:border-black/10 hover:text-ink transition-colors duration-200"
                >
                  Cancel
                </button>

                {currentStep < 3 ? (
                  <button
                    id="modal-next-step"
                    onClick={goNext}
                    className="px-5 py-2 bg-ink text-white rounded-xl text-sm font-medium hover:bg-black active:scale-[0.98] transition-all duration-200 shadow-sm flex items-center gap-1.5"
                  >
                    Next
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    id="modal-seal-capsule"
                    onClick={handleSubmit}
                    disabled={isSubmitting || !isPhase3Valid}
                    className={cn(
                      "px-5 py-2 bg-brand text-white rounded-xl text-sm font-medium active:scale-[0.98] transition-all duration-200 shadow-sm flex items-center gap-1.5",
                      isSubmitting || !isPhase3Valid
                        ? "opacity-60 cursor-not-allowed"
                        : "hover:bg-brand-light"
                    )}
                  >
                    {isSubmitting || isUploading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        {isUploading ? 'Uploading...' : 'Sealing...'}
                      </>
                    ) : (
                      'Seal Capsule'
                    )}
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
