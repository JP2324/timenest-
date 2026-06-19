import type { CapsuleType } from '../models/capsule.model';

// ── Group Recipient ──────────────────────────────────────────────────────────

/**
 * A single recipient entry for group capsules.
 * At least one of username or email must be provided.
 */
export interface GroupRecipientEntry {
  username?: string;
  email?: string;
}

// ── Create Payload ───────────────────────────────────────────────────────────

/**
 * Payload the frontend sends to create a new capsule.
 */
export interface CreateCapsulePayload {
  title: string;
  message?: string;
  recipientEmail?: string;
  recipientUsername?: string;
  mediaUrls: string[];
  capsuleType: CapsuleType;
  unlockDate: string; // ISO 8601 date string
  /** Required when capsuleType is 'group' */
  groupRecipients?: GroupRecipientEntry[];
}

// ── ImageKit Upload ──────────────────────────────────────────────────────────

/**
 * Shape returned by ImageKit after a successful file upload.
 */
export interface ImageKitUploadResult {
  url: string;
  fileId: string;
  name: string;
}
