import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, LockKeyhole, LockOpen, FileText, Loader2, AlertCircle, Download } from 'lucide-react';
import { useAuth } from '@clerk/clerk-react';
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

// ── Helpers ───────────────────────────────────────────────────────────────────

const VIDEO_EXTENSIONS = ['.mp4', '.webm', '.ogg', '.mov'];

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

const isVideoUrl = (url: string): boolean => VIDEO_EXTENSIONS.includes(getFileExtension(url));

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

      {/* Media Gallery */}
      {capsule.mediaUrls.length > 0 && (
        <div className="bg-white border border-black/5 rounded-2xl p-6">
          <label className="text-[11px] uppercase font-semibold tracking-wider text-ink-muted mb-4 block">
            Memories ({capsule.mediaUrls.length} {capsule.mediaUrls.length === 1 ? 'file' : 'files'})
          </label>
          <div className="space-y-4">
            {capsule.mediaUrls.map((url, index) => (
              <MediaItem key={`${url}-${index}`} url={url} />
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
    </div>
  );
}

// ── Media Item ───────────────────────────────────────────────────────────────

/**
 * Renders a media item from a URL. Videos are detected by extension.
 * Everything else is first attempted as an image (handles ImageKit URLs
 * that lack file extensions). Falls back to a download link on error.
 */
function MediaItem({ url }: { url: string; key?: React.Key }) {
  const [imageError, setImageError] = useState(false);
  const fileName = getFileName(url);

  // Videos — always render with <video>
  if (isVideoUrl(url)) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="rounded-xl overflow-hidden border border-black/5"
      >
        <video
          src={url}
          controls
          className="w-full max-h-[400px] bg-black"
          preload="metadata"
        />
      </motion.div>
    );
  }

  // Non-video: try as image first, fall back to download link on error
  if (!imageError) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="rounded-xl overflow-hidden border border-black/5"
      >
        <img
          src={url}
          alt={fileName}
          className="w-full max-h-[400px] object-contain bg-paper"
          loading="lazy"
          onError={() => setImageError(true)}
        />
      </motion.div>
    );
  }

  // Fallback — file download link
  return (
    <motion.a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "flex items-center gap-3 px-4 py-3 bg-paper rounded-xl border border-black/5",
        "hover:border-black/10 hover:shadow-sm transition-all duration-200"
      )}
    >
      <div className="w-9 h-9 rounded-lg bg-brand-soft flex items-center justify-center shrink-0">
        <FileText className="w-4 h-4 text-brand" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-ink truncate">{fileName}</p>
        <p className="text-[10px] text-ink-muted">Click to open</p>
      </div>
      <Download className="w-4 h-4 text-ink-muted shrink-0" />
    </motion.a>
  );
}
