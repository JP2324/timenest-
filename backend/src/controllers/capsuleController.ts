import { Request, Response, NextFunction } from 'express';
import { getAuth } from '@clerk/express';
import mongoose from 'mongoose';
import * as capsuleService from '../services/capsuleService';
import type { CreateCapsulePayload } from '../types/capsule.types';

/**
 * POST /api/capsules
 * Creates a new capsule for the authenticated user.
 * Supports both normal (time) and group capsule types.
 */
export const createCapsule = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const auth = getAuth(req);
    const clerkId = auth.userId;

    if (!clerkId) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const { title, message, recipientEmail, recipientUsername, mediaUrls, capsuleType, unlockDate, groupRecipients } = req.body as CreateCapsulePayload;

    if (!title || !title.trim()) {
      res.status(400).json({ success: false, message: 'Capsule title is required' });
      return;
    }

    if (!unlockDate) {
      res.status(400).json({ success: false, message: 'Unlock date is required' });
      return;
    }

    const parsedUnlockDate = new Date(unlockDate);
    if (parsedUnlockDate <= new Date()) {
      res.status(400).json({ success: false, message: 'Unlock date must be in the future' });
      return;
    }

    // Group capsules require at least one recipient
    if (capsuleType === 'group') {
      if (!groupRecipients || !Array.isArray(groupRecipients) || groupRecipients.length === 0) {
        res.status(400).json({ success: false, message: 'Group capsules require at least one recipient' });
        return;
      }
    }

    const capsule = await capsuleService.createCapsule(clerkId, {
      title: title.trim(),
      message,
      recipientEmail,
      recipientUsername,
      mediaUrls: mediaUrls || [],
      capsuleType: capsuleType || 'time',
      unlockDate,
      groupRecipients,
    });

    res.status(201).json({ success: true, capsule });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/capsules/mine
 * Returns all capsules created by the authenticated user.
 */
export const getMyCapsules = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const auth = getAuth(req);
    const clerkId = auth.userId;

    if (!clerkId) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const capsules = await capsuleService.getCapsulesByCreator(clerkId);
    res.status(200).json({ success: true, capsules });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/capsules/received
 * Returns all capsules where the authenticated user is a recipient.
 */
export const getReceivedCapsules = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const auth = getAuth(req);
    const clerkId = auth.userId;

    if (!clerkId) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const capsules = await capsuleService.getReceivedCapsules(clerkId);
    res.status(200).json({ success: true, capsules });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/capsules/:id
 * Returns a single capsule by ID. Only the creator or a recipient may access it.
 * Locked capsules have sensitive content (message, mediaUrls) withheld.
 */
export const getCapsuleById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const auth = getAuth(req);
    const clerkId = auth.userId;

    if (!clerkId) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const { id } = req.params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ success: false, message: 'Invalid capsule ID' });
      return;
    }

    const { capsule, forbidden } = await capsuleService.getCapsuleById(id, clerkId);

    if (forbidden) {
      res.status(403).json({ success: false, message: 'You do not have access to this capsule' });
      return;
    }

    if (!capsule) {
      res.status(404).json({ success: false, message: 'Capsule not found' });
      return;
    }

    res.status(200).json({ success: true, capsule });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/capsules/upload
 * Uploads file(s) to ImageKit. Accepts multipart/form-data.
 * Returns an array of uploaded file URLs.
 */
export const uploadMedia = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const auth = getAuth(req);
    const clerkId = auth.userId;

    if (!clerkId) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const files = req.files as Express.Multer.File[] | undefined;

    if (!files || files.length === 0) {
      res.status(400).json({ success: false, message: 'No files provided' });
      return;
    }

    const uploadPromises = files.map((file) =>
      capsuleService.uploadFileToImageKit(file.buffer, file.originalname)
    );

    const results = await Promise.all(uploadPromises);
    const urls = results.map((result) => result.url);

    res.status(200).json({ success: true, urls });
  } catch (error) {
    next(error);
  }
};
