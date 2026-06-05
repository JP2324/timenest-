/**
 * Payload the frontend sends to create a new capsule.
 */
export interface CreateCapsulePayload {
  title: string;
  message?: string;
  recipientEmail?: string;
  recipientUsername?: string;
  mediaUrls: string[];
  capsuleType: 'time';
  unlockDate: string; // ISO 8601 date string
}

/**
 * Shape returned by ImageKit after a successful file upload.
 */
export interface ImageKitUploadResult {
  url: string;
  fileId: string;
  name: string;
}
