import mongoose, { Schema, Document, Types } from 'mongoose';

// ── Constants ────────────────────────────────────────────────────────────────

export const CAPSULE_TYPES = ['time', 'group', 'location'] as const;
export const CAPSULE_STATUSES = ['locked', 'unlocked'] as const;

export type CapsuleType = (typeof CAPSULE_TYPES)[number];
export type CapsuleStatus = (typeof CAPSULE_STATUSES)[number];

// ── Sub-document Interfaces ──────────────────────────────────────────────────

export interface IUnlockLocation {
  latitude: number;
  longitude: number;
  /** Geofence radius in meters */
  radius: number;
  locationName?: string;
}

export interface IGroupMember {
  userId: Types.ObjectId;
  username: string;
}

export interface IGroupDetails {
  groupName: string;
  members: IGroupMember[];
}

// ── Main Interface ───────────────────────────────────────────────────────────

export interface ICapsule extends Document {
  creator: Types.ObjectId;
  title: string;
  message?: string;
  mediaUrls: string[];
  capsuleType: CapsuleType;
  status: CapsuleStatus;
  recipients: Types.ObjectId[];
  unlockDate?: Date;
  unlockLocation?: IUnlockLocation;
  groupDetails?: IGroupDetails;
  isOpened: boolean;
  openedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// ── Sub-schemas ──────────────────────────────────────────────────────────────

const unlockLocationSchema = new Schema<IUnlockLocation>(
  {
    latitude: {
      type: Number,
      required: [true, 'Latitude is required for location-based capsules'],
      min: [-90, 'Latitude must be between -90 and 90'],
      max: [90, 'Latitude must be between -90 and 90'],
    },
    longitude: {
      type: Number,
      required: [true, 'Longitude is required for location-based capsules'],
      min: [-180, 'Longitude must be between -180 and 180'],
      max: [180, 'Longitude must be between -180 and 180'],
    },
    radius: {
      type: Number,
      required: [true, 'Geofence radius is required for location-based capsules'],
      min: [1, 'Radius must be at least 1 meter'],
    },
    locationName: {
      type: String,
      trim: true,
      default: undefined,
    },
  },
  { _id: false }
);

const groupMemberSchema = new Schema<IGroupMember>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Group member userId is required'],
    },
    username: {
      type: String,
      required: [true, 'Group member username is required'],
      trim: true,
    },
  },
  { _id: false }
);

const groupDetailsSchema = new Schema<IGroupDetails>(
  {
    groupName: {
      type: String,
      required: [true, 'Group name is required for group capsules'],
      trim: true,
    },
    members: {
      type: [groupMemberSchema],
      default: [],
    },
  },
  { _id: false }
);

// ── Main Schema ──────────────────────────────────────────────────────────────

const capsuleSchema = new Schema<ICapsule>(
  {
    creator: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Capsule creator is required'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Capsule title is required'],
      trim: true,
      maxlength: [150, 'Title must not exceed 150 characters'],
    },
    message: {
      type: String,
      trim: true,
      default: undefined,
    },
    mediaUrls: {
      type: [String],
      default: [],
    },
    capsuleType: {
      type: String,
      enum: {
        values: CAPSULE_TYPES,
        message: 'Capsule type must be one of: time, group, location',
      },
      required: [true, 'Capsule type is required'],
      index: true,
    },
    status: {
      type: String,
      enum: {
        values: CAPSULE_STATUSES,
        message: 'Status must be one of: locked, unlocked',
      },
      default: 'locked',
      index: true,
    },
    recipients: {
      type: [{ type: Schema.Types.ObjectId, ref: 'User' }],
      default: [],
    },
    // Unlock date validation is intentionally left to the service layer
    // so that admin operations and migrations can set arbitrary dates
    unlockDate: {
      type: Date,
      default: undefined,
      index: true,
    },
    unlockLocation: {
      type: unlockLocationSchema,
      default: undefined,
    },
    groupDetails: {
      type: groupDetailsSchema,
      default: undefined,
    },
    isOpened: {
      type: Boolean,
      default: false,
    },
    openedAt: {
      type: Date,
      default: undefined,
    },
  },
  {
    timestamps: true,
  }
);

// ── Indexes ──────────────────────────────────────────────────────────────────

// Efficiently query capsules received by a user, filtered by status
capsuleSchema.index({ recipients: 1, status: 1 });

// Efficiently find capsules due for time-based unlocking
capsuleSchema.index({ status: 1, unlockDate: 1 });

// ── Model ────────────────────────────────────────────────────────────────────

export const Capsule = mongoose.model<ICapsule>('Capsule', capsuleSchema);
