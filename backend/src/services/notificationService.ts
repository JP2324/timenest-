import { Notification } from '../models/notification.model';
import { User } from '../models/user.model';
import type { INotification } from '../models/notification.model';
import type { CreateNotificationPayload } from '../types/notification.types';

// ── Create ───────────────────────────────────────────────────────────────────

/**
 * Creates a single notification document.
 */
export const createNotification = async (payload: CreateNotificationPayload): Promise<INotification> => {
  const notification = await Notification.create({
    recipient: payload.recipientId,
    type: payload.type,
    title: payload.title,
    message: payload.message,
    metadata: payload.metadata ?? {},
  });

  return notification;
};

/**
 * Bulk-creates notifications for all group capsule recipients.
 * Skips notification for any recipientId that matches the creator.
 */
export const createGroupCapsuleNotifications = async (
  creatorUsername: string,
  creatorId: string,
  capsuleId: string,
  capsuleTitle: string,
  recipientIds: string[]
): Promise<void> => {
  const notifications = recipientIds
    .filter((recipientId) => recipientId !== creatorId)
    .map((recipientId) => ({
      recipient: recipientId,
      type: 'group_capsule_received' as const,
      title: 'New Group Capsule',
      message: `@${creatorUsername} created a group capsule "${capsuleTitle}" for you!`,
      metadata: {
        capsuleId,
        creatorUsername,
        creatorId,
      },
    }));

  if (notifications.length > 0) {
    await Notification.insertMany(notifications);
  }
};

// ── Read ─────────────────────────────────────────────────────────────────────

/**
 * Returns all notifications for a user, sorted newest first.
 */
export const getNotificationsForUser = async (clerkId: string): Promise<INotification[]> => {
  const user = await User.findOne({ clerkId });
  if (!user) return [];

  const notifications = await Notification.find({ recipient: user._id })
    .sort({ createdAt: -1 })
    .limit(50);

  return notifications;
};

/**
 * Returns the count of unread notifications for a user.
 */
export const getUnreadCount = async (clerkId: string): Promise<number> => {
  const user = await User.findOne({ clerkId });
  if (!user) return 0;

  const count = await Notification.countDocuments({
    recipient: user._id,
    isRead: false,
  });

  return count;
};

// ── Update ───────────────────────────────────────────────────────────────────

/**
 * Marks a single notification as read.
 * Verifies ownership before updating.
 */
export const markNotificationAsRead = async (
  notificationId: string,
  clerkId: string
): Promise<INotification | null> => {
  const user = await User.findOne({ clerkId });
  if (!user) return null;

  const notification = await Notification.findOneAndUpdate(
    { _id: notificationId, recipient: user._id },
    { $set: { isRead: true } },
    { new: true }
  );

  return notification;
};

/**
 * Marks all notifications as read for a user.
 */
export const markAllNotificationsAsRead = async (clerkId: string): Promise<void> => {
  const user = await User.findOne({ clerkId });
  if (!user) return;

  await Notification.updateMany(
    { recipient: user._id, isRead: false },
    { $set: { isRead: true } }
  );
};
