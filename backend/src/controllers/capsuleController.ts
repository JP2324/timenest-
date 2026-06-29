import { Request, Response, NextFunction } from 'express';
import { getAuth } from '@clerk/express';
import mongoose from 'mongoose';
import * as capsuleService from '../services/capsuleService';
import type { CreateCapsulePayload } from '../types/capsule.types';

// ── Validation Constants ─────────────────────────────────────────────────────

const MIN_LATITUDE = -90;
const MAX_LATITUDE = 90;
const MIN_LONGITUDE = -180;
const MAX_LONGITUDE = 180;
const MIN_GEOFENCE_RADIUS_METERS = 1;

/**
 * POST /api/capsules
 * Creates a new capsule for the authenticated user.
 * Supports time, group, and location capsule types.
 */
export const createCapsule = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const auth = getAuth(req);
    const clerkId = auth.userId;

    if (!clerkId) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const { title, message, recipientEmail, recipientUsername, mediaUrls, capsuleType, unlockDate, groupRecipients, unlockLocation } = req.body as CreateCapsulePayload;

    if (!title || !title.trim()) {
      res.status(400).json({ success: false, message: 'Capsule title is required' });
      return;
    }

    // Time and group capsules require an unlock date
    if (capsuleType !== 'location') {
      if (!unlockDate) {
        res.status(400).json({ success: false, message: 'Unlock date is required' });
        return;
      }

      const parsedUnlockDate = new Date(unlockDate);
      if (parsedUnlockDate <= new Date()) {
        res.status(400).json({ success: false, message: 'Unlock date must be in the future' });
        return;
      }
    }

    // Group capsules require at least one recipient
    if (capsuleType === 'group') {
      if (!groupRecipients || !Array.isArray(groupRecipients) || groupRecipients.length === 0) {
        res.status(400).json({ success: false, message: 'Group capsules require at least one recipient' });
        return;
      }
    }

    // Location capsules require valid coordinates and radius
    if (capsuleType === 'location') {
      if (!unlockLocation) {
        res.status(400).json({ success: false, message: 'Location data is required for location-based capsules' });
        return;
      }

      const { latitude, longitude, radius } = unlockLocation;

      if (typeof latitude !== 'number' || latitude < MIN_LATITUDE || latitude > MAX_LATITUDE) {
        res.status(400).json({ success: false, message: 'Latitude must be between -90 and 90' });
        return;
      }

      if (typeof longitude !== 'number' || longitude < MIN_LONGITUDE || longitude > MAX_LONGITUDE) {
        res.status(400).json({ success: false, message: 'Longitude must be between -180 and 180' });
        return;
      }

      if (typeof radius !== 'number' || radius < MIN_GEOFENCE_RADIUS_METERS) {
        res.status(400).json({ success: false, message: 'Radius must be at least 1 meter' });
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
      unlockLocation,
    });

    res.status(201).json({ success: true, capsule });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/capsules/:id/verify-location
 * Verifies the recipient's current location against the capsule's unlock location.
 * Unlocks the capsule if the user is within the geofence radius.
 */
export const verifyLocation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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

    const { latitude, longitude } = req.body;

    if (typeof latitude !== 'number' || latitude < MIN_LATITUDE || latitude > MAX_LATITUDE) {
      res.status(400).json({ success: false, message: 'Valid latitude is required' });
      return;
    }

    if (typeof longitude !== 'number' || longitude < MIN_LONGITUDE || longitude > MAX_LONGITUDE) {
      res.status(400).json({ success: false, message: 'Valid longitude is required' });
      return;
    }

    const result = await capsuleService.verifyAndUnlockLocation(id, clerkId, latitude, longitude);

    if (result.forbidden) {
      res.status(403).json({ success: false, message: 'You do not have access to this capsule' });
      return;
    }

    if (result.notFound) {
      res.status(404).json({ success: false, message: 'Capsule not found' });
      return;
    }

    if (result.notLocationCapsule) {
      res.status(400).json({ success: false, message: 'This capsule does not use location-based unlocking' });
      return;
    }

    if (result.alreadyUnlocked) {
      res.status(200).json({ success: true, message: 'Capsule is already unlocked', capsule: result.capsule });
      return;
    }

    if (!result.withinRadius) {
      res.status(200).json({
        success: false,
        message: 'You are not at the correct location. Move closer to the designated area and try again.',
        withinRadius: false,
      });
      return;
    }

    res.status(200).json({ success: true, message: 'Location verified! Capsule unlocked.', capsule: result.capsule });
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
