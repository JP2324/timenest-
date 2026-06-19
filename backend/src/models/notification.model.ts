import mongoose, { Schema, Document, Types } from 'mongoose';

// ── Constants ────────────────────────────────────────────────────────────────

export const NOTIFICATION_TYPES = ['group_capsule_received'] as const;

export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

// ── Interface ────────────────────────────────────────────────────────────────

export interface INotificationMetadata {
  capsuleId?: string;
  creatorUsername?: string;
  creatorId?: string;
}

export interface INotification extends Document {
  recipient: Types.ObjectId;
  type: NotificationType;
  title: string;
  message: string;
  metadata: INotificationMetadata;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ── Schema ───────────────────────────────────────────────────────────────────

const notificationSchema = new Schema<INotification>(
  {
    recipient: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Notification recipient is required'],
      index: true,
    },
    type: {
      type: String,
      enum: {
        values: NOTIFICATION_TYPES,
        message: 'Notification type must be one of: group_capsule_received',
      },
      required: [true, 'Notification type is required'],
    },
    title: {
      type: String,
      required: [true, 'Notification title is required'],
      trim: true,
    },
    message: {
      type: String,
      required: [true, 'Notification message is required'],
      trim: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// ── Indexes ──────────────────────────────────────────────────────────────────

// Efficiently query unread notifications for a user, sorted by newest first
notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

// ── Model ────────────────────────────────────────────────────────────────────

export const Notification = mongoose.model<INotification>('Notification', notificationSchema);
