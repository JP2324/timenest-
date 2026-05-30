import mongoose, { Schema, Document } from 'mongoose';

// ── Interface ────────────────────────────────────────────────────────────────

export interface IUser extends Document {
  clerkId: string;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ── Schema ───────────────────────────────────────────────────────────────────

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const userSchema = new Schema<IUser>(
  {
    clerkId: {
      type: String,
      required: [true, 'Clerk ID is required'],
      unique: true,
      index: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      index: true,
      lowercase: true,
      trim: true,
      match: [EMAIL_REGEX, 'Please provide a valid email address'],
    },
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      index: true,
      trim: true,
      minlength: [3, 'Username must be at least 3 characters'],
      maxlength: [30, 'Username must not exceed 30 characters'],
    },
    firstName: {
      type: String,
      trim: true,
      default: undefined,
    },
    lastName: {
      type: String,
      trim: true,
      default: undefined,
    },
    fullName: {
      type: String,
      trim: true,
      default: undefined,
    },
    imageUrl: {
      type: String,
      default: undefined,
    },
  },
  {
    timestamps: true,
  }
);

// ── Model ────────────────────────────────────────────────────────────────────

export const User = mongoose.model<IUser>('User', userSchema);

