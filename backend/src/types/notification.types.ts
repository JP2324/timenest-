import type { NotificationType } from '../models/notification.model';

/**
 * Payload used internally to create a notification.
 */
export interface CreateNotificationPayload {
  recipientId: string;
  type: NotificationType;
  title: string;
  message: string;
  metadata?: {
    capsuleId?: string;
    creatorUsername?: string;
    creatorId?: string;
  };
}
