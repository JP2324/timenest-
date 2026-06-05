import mongoose from 'mongoose';
import { Capsule } from '../models/capsule.model';
import { User } from '../models/user.model';
import imagekitClient from '../config/imagekit';
import type { ICapsule } from '../models/capsule.model';
import type { CreateCapsulePayload, ImageKitUploadResult } from '../types/capsule.types';

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Bulk-updates all capsules whose unlockDate has passed but whose
 * status still reads 'locked'. Called lazily on every read path so
 * the DB stays in sync without a cron job.
 */
const syncExpiredCapsuleStatuses = async (): Promise<void> => {
  await Capsule.updateMany(
    { status: 'locked', unlockDate: { $lte: new Date() } },
    { $set: { status: 'unlocked' } }
  );
};

// ── Create ───────────────────────────────────────────────────────────────────

/**
 * Creates a new time-based capsule and saves it to MongoDB.
 * Resolves the creator's clerkId → ObjectId, and optionally resolves
 * the recipient by username or email if a matching user exists.
 */
export const createCapsule = async (
  creatorClerkId: string,
  payload: CreateCapsulePayload
): Promise<ICapsule> => {
  const creator = await User.findOne({ clerkId: creatorClerkId });

  if (!creator) {
    throw new Error('Creator user not found in database');
  }

  const recipients = await resolveRecipients(payload.recipientEmail, payload.recipientUsername);

  const capsule = await Capsule.create({
    creator: creator._id,
    title: payload.title,
    message: payload.message ?? undefined,
    mediaUrls: payload.mediaUrls,
    capsuleType: payload.capsuleType,
    status: 'locked',
    recipients,
    unlockDate: new Date(payload.unlockDate),
  });

  return capsule;
};

/**
 * Resolves a recipient by username or email to an array of User ObjectIds.
 * Username takes priority. Returns an empty array if no match is found.
 */
const resolveRecipients = async (email?: string, username?: string): Promise<string[]> => {
  const recipientIds: string[] = [];

  if (username) {
    const userByUsername = await User.findOne({ username: username.trim() });
    if (userByUsername) {
      recipientIds.push(userByUsername._id.toString());
    }
  }

  if (email) {
    const userByEmail = await User.findOne({ email: email.toLowerCase().trim() });
    if (userByEmail && !recipientIds.includes(userByEmail._id.toString())) {
      recipientIds.push(userByEmail._id.toString());
    }
  }

  return recipientIds;
};

// ── Read ─────────────────────────────────────────────────────────────────────

/**
 * Returns all capsules created by a given user (identified by clerkId).
 * Syncs expired statuses before querying.
 */
export const getCapsulesByCreator = async (clerkId: string): Promise<ICapsule[]> => {
  const user = await User.findOne({ clerkId });
  if (!user) return [];

  await syncExpiredCapsuleStatuses();

  const capsules = await Capsule.find({ creator: user._id })
    .sort({ createdAt: -1 });

  return capsules;
};

/**
 * Returns all capsules received by a given user (identified by clerkId).
 * Syncs expired statuses before querying.
 */
export const getReceivedCapsules = async (clerkId: string): Promise<ICapsule[]> => {
  const user = await User.findOne({ clerkId });
  if (!user) return [];

  await syncExpiredCapsuleStatuses();

  const capsules = await Capsule.find({ recipients: user._id })
    .sort({ createdAt: -1 });

  return capsules;
};

/**
 * Returns a single capsule by its ID, enforcing access control.
 * Only the creator or a recipient may view a capsule.
 * Locked capsules have message and mediaUrls withheld.
 */
export const getCapsuleById = async (
  capsuleId: string,
  clerkId: string
): Promise<{ capsule: ICapsule | null; forbidden: boolean }> => {
  if (!mongoose.Types.ObjectId.isValid(capsuleId)) {
    return { capsule: null, forbidden: false };
  }

  const user = await User.findOne({ clerkId });
  if (!user) return { capsule: null, forbidden: true };

  const userId = user._id.toString();

  // Sync this specific capsule's status if it expired
  await Capsule.updateOne(
    { _id: capsuleId, status: 'locked', unlockDate: { $lte: new Date() } },
    { $set: { status: 'unlocked' } }
  );

  const capsule = await Capsule.findById(capsuleId);
  if (!capsule) return { capsule: null, forbidden: false };

  // Access control: only creator or recipient
  const isCreator = capsule.creator.toString() === userId;
  const isRecipient = capsule.recipients.some(
    (recipientId) => recipientId.toString() === userId
  );

  if (!isCreator && !isRecipient) {
    return { capsule: null, forbidden: true };
  }

  // Withhold sensitive content from locked capsules
  if (capsule.status === 'locked') {
    capsule.message = undefined;
    capsule.mediaUrls = [];
  }

  return { capsule, forbidden: false };
};

// ── Upload ───────────────────────────────────────────────────────────────────

/**
 * Uploads a single file buffer to ImageKit under the /capsules folder.
 * Returns the public URL, file ID, and file name.
 */
export const uploadFileToImageKit = async (
  fileBuffer: Buffer,
  fileName: string
): Promise<ImageKitUploadResult> => {
  const result = await imagekitClient.upload({
    file: fileBuffer,
    fileName,
    folder: '/capsules',
  });

  return {
    url: result.url,
    fileId: result.fileId,
    name: result.name,
  };
};
