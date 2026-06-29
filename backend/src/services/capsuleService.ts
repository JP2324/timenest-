import mongoose from 'mongoose';
import { Capsule } from '../models/capsule.model';
import { User } from '../models/user.model';
import imagekitClient from '../config/imagekit';
import * as notificationService from './notificationService';
import type { ICapsule, IGroupMember } from '../models/capsule.model';
import type { CreateCapsulePayload, GroupRecipientEntry, ImageKitUploadResult } from '../types/capsule.types';

// ── Constants ────────────────────────────────────────────────────────────────

/** Mean radius of the Earth in meters (WGS-84) */
const EARTH_RADIUS_METERS = 6_371_000;

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Bulk-updates all capsules whose unlockDate has passed but whose
 * status still reads 'locked'. Called lazily on every read path so
 * the DB stays in sync without a cron job.
 *
 * Location capsules have no unlockDate, so they are naturally excluded.
 */
const syncExpiredCapsuleStatuses = async (): Promise<void> => {
  await Capsule.updateMany(
    { status: 'locked', unlockDate: { $lte: new Date() } },
    { $set: { status: 'unlocked' } }
  );
};

/**
 * Calculates the great-circle distance between two coordinates
 * on the Earth's surface using the Haversine formula.
 *
 * @returns Distance in meters
 */
const calculateHaversineDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

  const deltaLat = toRadians(lat2 - lat1);
  const deltaLon = toRadians(lon2 - lon1);

  const halfChordSquared =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(deltaLon / 2) ** 2;

  const angularDistance = 2 * Math.atan2(Math.sqrt(halfChordSquared), Math.sqrt(1 - halfChordSquared));

  return EARTH_RADIUS_METERS * angularDistance;
};

// ── Recipient Resolution ─────────────────────────────────────────────────────

/**
 * Resolves a single recipient by username or email to an array of User ObjectIds.
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

/**
 * Resolves multiple group recipients by username or email.
 * Returns deduplicated recipient IDs and a members list for groupDetails.
 */
const resolveGroupRecipients = async (
  entries: GroupRecipientEntry[]
): Promise<{ recipientIds: string[]; members: IGroupMember[] }> => {
  const recipientIds: string[] = [];
  const members: IGroupMember[] = [];
  const seenIds = new Set<string>();

  for (const entry of entries) {
    let foundUser = null;

    if (entry.username) {
      foundUser = await User.findOne({ username: entry.username.trim() });
    }

    if (!foundUser && entry.email) {
      foundUser = await User.findOne({ email: entry.email.toLowerCase().trim() });
    }

    if (foundUser) {
      const idStr = foundUser._id.toString();

      // Skip duplicates
      if (seenIds.has(idStr)) continue;

      seenIds.add(idStr);
      recipientIds.push(idStr);
      members.push({
        userId: foundUser._id,
        username: foundUser.username,
      });
    }
  }

  return { recipientIds, members };
};

// ── Create ───────────────────────────────────────────────────────────────────

/**
 * Creates a new capsule and saves it to MongoDB.
 * Handles time, group, and location capsule types.
 *
 * For group capsules:
 *  - Resolves multiple recipients from the groupRecipients array
 *  - Populates groupDetails with auto-generated group name and member list
 *  - Sends notifications to all recipients
 *
 * For location capsules:
 *  - Stores unlock coordinates and geofence radius
 *  - Does not set an unlockDate (recipient must physically verify)
 */
export const createCapsule = async (
  creatorClerkId: string,
  payload: CreateCapsulePayload
): Promise<ICapsule> => {
  const creator = await User.findOne({ clerkId: creatorClerkId });

  if (!creator) {
    throw new Error('Creator user not found in database');
  }

  let recipients: string[] = [];
  let groupDetails = undefined;

  if (payload.capsuleType === 'group') {
    if (!payload.groupRecipients || payload.groupRecipients.length === 0) {
      throw new Error('Group capsules require at least one recipient');
    }

    const resolved = await resolveGroupRecipients(payload.groupRecipients);

    if (resolved.recipientIds.length === 0) {
      throw new Error('No valid recipients found. Please check the usernames or emails provided.');
    }

    recipients = resolved.recipientIds;
    groupDetails = {
      groupName: `Group Capsule by @${creator.username}`,
      members: resolved.members,
    };
  } else {
    // Both time and location capsules use single-recipient resolution
    recipients = await resolveRecipients(payload.recipientEmail, payload.recipientUsername);
  }

  const capsule = await Capsule.create({
    creator: creator._id,
    title: payload.title,
    message: payload.message ?? undefined,
    mediaUrls: payload.mediaUrls,
    capsuleType: payload.capsuleType,
    status: 'locked',
    recipients,
    unlockDate: payload.capsuleType === 'location' ? undefined : new Date(payload.unlockDate!),
    unlockLocation: payload.capsuleType === 'location' ? payload.unlockLocation : undefined,
    groupDetails,
  });

  // Send notifications to all group recipients after capsule creation
  if (payload.capsuleType === 'group' && recipients.length > 0) {
    await notificationService.createGroupCapsuleNotifications(
      creator.username,
      creator._id.toString(),
      capsule._id.toString(),
      capsule.title,
      recipients
    );
  }

  return capsule;
};

// ── Location Verification ────────────────────────────────────────────────────

interface LocationVerificationResult {
  capsule?: ICapsule;
  forbidden?: boolean;
  notFound?: boolean;
  notLocationCapsule?: boolean;
  alreadyUnlocked?: boolean;
  withinRadius?: boolean;
}

/**
 * Verifies whether the user's current coordinates fall within the
 * capsule's geofence. If so, unlocks the capsule.
 */
export const verifyAndUnlockLocation = async (
  capsuleId: string,
  clerkId: string,
  userLatitude: number,
  userLongitude: number
): Promise<LocationVerificationResult> => {
  if (!mongoose.Types.ObjectId.isValid(capsuleId)) {
    return { notFound: true };
  }

  const user = await User.findOne({ clerkId });
  if (!user) return { forbidden: true };

  const capsule = await Capsule.findById(capsuleId);
  if (!capsule) return { notFound: true };

  // Access control: only a recipient may verify
  const userId = user._id.toString();
  const isRecipient = capsule.recipients.some(
    (recipientId) => recipientId.toString() === userId
  );
  const isCreator = capsule.creator.toString() === userId;

  if (!isRecipient && !isCreator) {
    return { forbidden: true };
  }

  if (capsule.capsuleType !== 'location' || !capsule.unlockLocation) {
    return { notLocationCapsule: true };
  }

  if (capsule.status === 'unlocked') {
    return { alreadyUnlocked: true, capsule };
  }

  const { latitude: targetLat, longitude: targetLon, radius } = capsule.unlockLocation;
  const distanceMeters = calculateHaversineDistance(userLatitude, userLongitude, targetLat, targetLon);

  if (distanceMeters > radius) {
    return { withinRadius: false };
  }

  // User is within the geofence — unlock the capsule
  capsule.status = 'unlocked';
  capsule.isOpened = true;
  capsule.openedAt = new Date();
  await capsule.save();

  return { withinRadius: true, capsule };
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

  // Sync this specific capsule's status if it expired (time-based only)
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
