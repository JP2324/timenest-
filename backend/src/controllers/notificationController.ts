import { Request, Response, NextFunction } from 'express';
import { getAuth } from '@clerk/express';
import mongoose from 'mongoose';
import * as notificationService from '../services/notificationService';

/**
 * GET /api/notifications
 * Returns all notifications for the authenticated user.
 */
export const getNotifications = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const auth = getAuth(req);
    const clerkId = auth.userId;

    if (!clerkId) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const notifications = await notificationService.getNotificationsForUser(clerkId);
    res.status(200).json({ success: true, notifications });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/notifications/unread-count
 * Returns the count of unread notifications.
 */
export const getUnreadCount = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const auth = getAuth(req);
    const clerkId = auth.userId;

    if (!clerkId) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const count = await notificationService.getUnreadCount(clerkId);
    res.status(200).json({ success: true, count });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/notifications/:id/read
 * Marks a single notification as read.
 */
export const markAsRead = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const auth = getAuth(req);
    const clerkId = auth.userId;

    if (!clerkId) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const { id } = req.params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ success: false, message: 'Invalid notification ID' });
      return;
    }

    const notification = await notificationService.markNotificationAsRead(id, clerkId);

    if (!notification) {
      res.status(404).json({ success: false, message: 'Notification not found' });
      return;
    }

    res.status(200).json({ success: true, notification });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/notifications/read-all
 * Marks all notifications as read for the authenticated user.
 */
export const markAllAsRead = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const auth = getAuth(req);
    const clerkId = auth.userId;

    if (!clerkId) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    await notificationService.markAllNotificationsAsRead(clerkId);
    res.status(200).json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    next(error);
  }
};
