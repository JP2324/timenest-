import { Capsule } from '../models/capsule.model';
import { User } from '../models/user.model';
import imagekitClient from '../config/imagekit';
import type { ICapsule } from '../models/capsule.model';
import type { CreateCapsulePayload, ImageKitUploadResult } from '../types/capsule.types';

/**
 * Creates a new time-based capsule and saves it to MongoDB.
 * Resolves the creator's clerkId → ObjectId, and optionally resolves
 * the recipient email → ObjectId if a matching user exists.
 */
export const createCapsule = async (
  creatorClerkId: string,
  payload: CreateCapsulePayload
): Promise<ICapsule> => {
  const creator = await User.findOne({ clerkId: creatorClerkId });

  if (!creator) {
    throw new Error('Creator user not found in database');
  }

  const recipients = await resolveRecipient(payload.recipientEmail);

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
 * Resolves a recipient email to an array of User ObjectIds.
 * Returns an empty array if no email is provided or no matching user is found.
 */
const resolveRecipient = async (email?: string): Promise<string[]> => {
  if (!email) return [];

  const recipient = await User.findOne({ email: email.toLowerCase().trim() });
  if (!recipient) return [];

  return [recipient._id.toString()];
};

/**
 * Returns all capsules created by a given user (identified by clerkId).
 */
export const getCapsulesByCreator = async (clerkId: string): Promise<ICapsule[]> => {
  const user = await User.findOne({ clerkId });
  if (!user) return [];

  const capsules = await Capsule.find({ creator: user._id })
    .sort({ createdAt: -1 });

  return capsules;
};

/**
 * Returns all capsules received by a given user (identified by clerkId).
 */
export const getReceivedCapsules = async (clerkId: string): Promise<ICapsule[]> => {
  const user = await User.findOne({ clerkId });
  if (!user) return [];

  const capsules = await Capsule.find({ recipients: user._id })
    .sort({ createdAt: -1 });

  return capsules;
};

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
