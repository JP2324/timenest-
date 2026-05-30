import { Request, Response, NextFunction } from 'express';
import { upsertUser, getUserByClerkId } from '../services/userService';
import type { ClerkUserPayload } from '../types/user.types';

/**
 * POST /api/users/sync
 * Syncs the Clerk user data into MongoDB via upsert.
 */
export const syncUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { clerkId, email, username, firstName, lastName, fullName, imageUrl } = req.body as ClerkUserPayload;

    if (!clerkId || !email || !username) {
      res.status(400).json({ success: false, message: 'clerkId, email, and username are required' });
      return;
    }

    const user = await upsertUser({ clerkId, email, username, firstName, lastName, fullName, imageUrl });

    res.status(200).json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/users/:clerkId
 * Retrieves a user by their Clerk ID.
 */
export const getUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { clerkId } = req.params;

    if (!clerkId) {
      res.status(400).json({ success: false, message: 'clerkId parameter is required' });
      return;
    }

    const user = await getUserByClerkId(clerkId);

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    res.status(200).json({ success: true, user });
  } catch (error) {
    next(error);
  }
};
