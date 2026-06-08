import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft,
  LockKeyhole,
  LockOpen,
  FileText,
  Loader2,
  AlertCircle,
  Download,
  Image as ImageIcon,
  Film,
  File,
  X,
} from 'lucide-react';
import { useAuth } from '@clerk/clerk-react';
import JSZip from 'jszip';
import { cn } from '../../lib/utils';
import type { Capsule } from './types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// ── Types ─────────────────────────────────────────────────────────────────────

interface CapsuleDetailViewProps {
  capsuleId: string;
  onBack: () => void;
}

type FetchState =
  | { status: 'loading' }
  | { status: 'success'; capsule: Capsule }
  | { status: 'error'; message: string };

type FileCategory = 'image' | 'pdf' | 'text' | 'video' | 'other';

// ── Helpers ───────────────────────────────────────────────────────────────────

const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp'];
const VIDEO_EXTENSIONS = ['.mp4', '.webm', '.ogg', '.mov'];
const PDF_EXTENSIONS = ['.pdf'];
const TEXT_EXTENSIONS = ['.txt'];

/** Extracts the file extension from a URL (lowercased, without query params). */
const getFileExtension = (url: string): string => {
  try {
    const pathname = new URL(url).pathname;
    const dotIndex = pathname.lastIndexOf('.');
    return dotIndex !== -1 ? pathname.slice(dotIndex).toLowerCase() : '';
  } catch {
    return '';
  }
};

/** Extracts a human-readable filename from a URL. */
const getFileName = (url: string): string => {
  try {
    const pathname = new URL(url).pathname;
    const segments = pathname.split('/');
    return decodeURIComponent(segments[segments.length - 1] || 'file');
  } catch {
    return 'file';
  }
};

/** Determines the category of a file based on its extension. */
const getFileCategory = (url: string): FileCategory => {
  const extension = getFileExtension(url);
  if (IMAGE_EXTENSIONS.includes(extension)) return 'image';
  if (PDF_EXTENSIONS.includes(extension)) return 'pdf';
  if (TEXT_EXTENSIONS.includes(extension)) return 'text';
  if (VIDEO_EXTENSIONS.includes(extension)) return 'video';
  return 'other';
};

/** Returns the appropriate Lucide icon component for a file category. */
const getFileIcon = (category: FileCategory) => {
  switch (category) {
    case 'image': return ImageIcon;
    case 'video': return Film;
    case 'pdf': return FileText;
    case 'text': return FileText;
    default: return File;
  }
};

/** Formats a date string into a human-friendly display. */
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

// ── Component ─────────────────────────────────────────────────────────────────

export function CapsuleDetailView({ capsuleId, onBack }: CapsuleDetailViewProps) {
  const { getToken } = useAuth();
  const [fetchState, setFetchState] = useState<FetchState>({ status: 'loading' });

  const fetchCapsule = useCallback(async (id: string) => {
    setFetchState({ status: 'loading' });

    try {
      const token = await getToken();
      const response = await fetch(`${API_BASE_URL}/capsules/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 403) {
        setFetchState({ status: 'error', message: 'You do not have access to this capsule.' });
        return;
      }

      if (response.status === 404) {
        setFetchState({ status: 'error', message: 'Capsule not found.' });
        return;
      }

      if (!response.ok) {
        setFetchState({ status: 'error', message: 'Failed to load capsule.' });
        return;
      }

      const data = await response.json();
      setFetchState({ status: 'success', capsule: data.capsule });
    } catch {
      setFetchState({ status: 'error', message: 'Network error. Please try again.' });
    }
  }, [getToken]);

  useEffect(() => {
    fetchCapsule(capsuleId);
  }, [capsuleId, fetchCapsule]);

  return (
    <motion.div
      key="capsule-detail"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Back Button */}
      <button
        id="capsule-detail-back"
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm font-medium text-ink-muted hover:text-ink transition-colors duration-200"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      {/* Loading */}
      {fetchState.status === 'loading' && (
        <div className="bg-white border border-black/5 rounded-2xl p-8 flex flex-col items-center justify-center py-16">
          <Loader2 className="w-6 h-6 text-brand animate-spin mb-3" />
          <p className="text-sm text-ink-muted">Loading capsule…</p>
        </div>
      )}

      {/* Error */}
      {fetchState.status === 'error' && (
        <div className="bg-white border border-black/5 rounded-2xl p-8 flex flex-col items-center justify-center py-16">
          <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center text-red-400 mb-3">
            <AlertCircle className="w-5 h-5" />
          </div>
          <p className="text-sm font-medium text-ink">{fetchState.message}</p>
          <button
            onClick={onBack}
            className="mt-4 px-4 py-2 text-sm font-medium text-ink-muted hover:text-ink border border-black/5 rounded-xl hover:border-black/10 transition-colors duration-200"
          >
            Go back
          </button>
        </div>
      )}

      {/* Success */}
      {fetchState.status === 'success' && (
        <CapsuleContent capsule={fetchState.capsule} />
      )}
    </motion.div>
  );
}

// ── Capsule Content ──────────────────────────────────────────────────────────

function CapsuleContent({ capsule }: { capsule: Capsule }) {
  const isLocked = capsule.status === 'locked';
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  // Locked state — guards against race conditions
  if (isLocked) {
    return (
      <div className="bg-white border border-black/5 rounded-2xl p-8 flex flex-col items-center justify-center text-center py-12">
        <div className="w-14 h-14 rounded-2xl bg-brand-soft flex items-center justify-center text-brand mb-4">
          <LockKeyhole className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold tracking-tight text-ink mb-1">
          This capsule is still locked
        </h3>
        <p className="text-sm text-ink-muted max-w-xs">
          {capsule.unlockDate
            ? `It will unlock on ${formatDate(capsule.unlockDate)}.`
            : 'The unlock date has not been set yet.'}
        </p>
      </div>
    );
  }

  /** Handles file click — opens modal for images/PDFs/videos, new tab for text/other. */
  const handleFileClick = (url: string) => {
    const category = getFileCategory(url);

    if (category === 'text' || category === 'other') {
      window.open(url, '_blank', 'noopener,noreferrer');
      return;
    }

    setPreviewUrl(url);
  };

  /** Downloads all capsule files as a single ZIP archive. */
  const handleDownloadAll = async () => {
    if (capsule.mediaUrls.length === 0) return;

    setIsDownloading(true);

    try {
      const zip = new JSZip();
      const fileNameCounts = new Map<string, number>();

      const fetchPromises = capsule.mediaUrls.map(async (url) => {
        try {
          const response = await fetch(url);
          if (!response.ok) {
            console.warn(`Failed to fetch file: ${url}`);
            return;
          }

          const blob = await response.blob();
          let fileName = getFileName(url);

          // Avoid duplicate filenames in the zip
          const existingCount = fileNameCounts.get(fileName) || 0;
          if (existingCount > 0) {
            const dotIndex = fileName.lastIndexOf('.');
            const baseName = dotIndex !== -1 ? fileName.slice(0, dotIndex) : fileName;
            const extension = dotIndex !== -1 ? fileName.slice(dotIndex) : '';
            fileName = `${baseName} (${existingCount})${extension}`;
          }
          fileNameCounts.set(getFileName(url), existingCount + 1);

          zip.file(fileName, blob);
        } catch (error) {
          console.warn(`Skipping file due to error: ${url}`, error);
        }
      });

      await Promise.all(fetchPromises);

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const sanitizedTitle = capsule.title.replace(/[^a-zA-Z0-9_-]/g, '_');
      const downloadUrl = URL.createObjectURL(zipBlob);

      const anchor = document.createElement('a');
      anchor.href = downloadUrl;
      anchor.download = `${sanitizedTitle}-memories.zip`;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);

      URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Failed to generate ZIP archive:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  // Unlocked — show full contents
  return (
    <div className="space-y-5">
      {/* Title Card */}
      <div className="bg-white border border-black/5 rounded-2xl p-6">
        <h2 className="text-xl font-semibold tracking-tight text-ink mb-3">
          {capsule.title}
        </h2>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-[11px] font-semibold bg-emerald-50 text-emerald-600">
            <LockOpen className="w-3 h-3" />
            Unlocked
          </span>
          {capsule.unlockDate && (
            <span className="text-xs text-ink-muted">
              {formatDate(capsule.unlockDate)}
            </span>
          )}
        </div>
      </div>

      {/* Message */}
      {capsule.message && (
        <div className="bg-white border border-black/5 rounded-2xl p-6">
          <label className="text-[11px] uppercase font-semibold tracking-wider text-ink-muted mb-2 block">
            Message
          </label>
          <p className="text-sm text-ink leading-relaxed whitespace-pre-wrap">
            {capsule.message}
          </p>
        </div>
      )}

      {/* File List */}
      {capsule.mediaUrls.length > 0 && (
        <div className="bg-white border border-black/5 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <label className="text-[11px] uppercase font-semibold tracking-wider text-ink-muted">
              Memories ({capsule.mediaUrls.length} {capsule.mediaUrls.length === 1 ? 'file' : 'files'})
            </label>
            <button
              id="download-all-memories"
              onClick={handleDownloadAll}
              disabled={isDownloading}
              className={cn(
                "inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200",
                "bg-brand text-white hover:bg-brand-light active:scale-95",
                isDownloading && "opacity-70 cursor-not-allowed"
              )}
            >
              {isDownloading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Preparing…
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  Download All
                </>
              )}
            </button>
          </div>

          <div className="space-y-1.5">
            {capsule.mediaUrls.map((url, index) => (
              <React.Fragment key={`${url}-${index}`}>
                <FileListItem
                  url={url}
                  onClick={() => handleFileClick(url)}
                />
              </React.Fragment>
            ))}
          </div>
        </div>
      )}

      {/* Empty content */}
      {!capsule.message && capsule.mediaUrls.length === 0 && (
        <div className="bg-white border border-black/5 rounded-2xl p-8 flex flex-col items-center justify-center text-center">
          <p className="text-sm text-ink-muted">This capsule has no message or media attached.</p>
        </div>
      )}

      {/* File Preview Modal */}
      <FilePreviewModal
        url={previewUrl}
        onClose={() => setPreviewUrl(null)}
      />
    </div>
  );
}

// ── File List Item ───────────────────────────────────────────────────────────

interface FileListItemProps {
  url: string;
  onClick: () => void;
}

/** Renders a single file row with a type-specific icon and filename. */
function FileListItem({ url, onClick }: FileListItemProps) {
  const fileName = getFileName(url);
  const category = getFileCategory(url);
  const Icon = getFileIcon(category);

  return (
    <motion.button
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 w-full px-4 py-3 bg-paper rounded-xl border border-black/5 text-left",
        "hover:border-black/10 hover:shadow-sm transition-all duration-200"
      )}
    >
      <div className="w-9 h-9 rounded-lg bg-brand-soft flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-brand" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-ink truncate">{fileName}</p>
        <p className="text-[10px] text-ink-muted">Click to open</p>
      </div>
    </motion.button>
  );
}

// ── File Preview Modal ──────────────────────────────────────────────────────

interface FilePreviewModalProps {
  url: string | null;
  onClose: () => void;
}

/**
 * Full-screen modal with a blurred backdrop for previewing images, PDFs, and videos.
 * Text and other file types are handled by the click handler (new tab), not this modal.
 */
function FilePreviewModal({ url, onClose }: FilePreviewModalProps) {
  const category = url ? getFileCategory(url) : null;

  // Close on Escape key
  useEffect(() => {
    if (!url) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [url, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (url) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [url]);

  return (
    <AnimatePresence>
      {url && (
        <motion.div
          key="file-preview-modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          {/* Blurred backdrop */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-md" />

          {/* Close button */}
          <button
            id="file-preview-close"
            onClick={onClose}
            className="absolute top-5 right-5 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors duration-200"
          >
            <X className="w-5 h-5 text-white" />
          </button>

          {/* Content container — stop click propagation to avoid closing on content click */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="relative z-10 max-w-5xl w-full max-h-[90vh] flex items-center justify-center"
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
          >
            {category === 'image' && (
              <img
                src={url}
                alt={getFileName(url)}
                className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl"
              />
            )}

            {category === 'pdf' && (
              <iframe
                src={url}
                title={getFileName(url)}
                className="w-full h-[85vh] rounded-xl shadow-2xl bg-white"
              />
            )}

            {category === 'video' && (
              <video
                src={url}
                controls
                autoPlay
                className="max-w-full max-h-[85vh] rounded-xl shadow-2xl bg-black"
              />
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
