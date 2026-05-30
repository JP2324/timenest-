import mongoose, { Schema, Document, Types } from 'mongoose';

// ── Interface ────────────────────────────────────────────────────────────────

export interface IGroupMember {
  userId: Types.ObjectId;
  username: string;
}

export interface IGroup extends Document {
  name: string;
  createdBy: Types.ObjectId;
  members: IGroupMember[];
  createdAt: Date;
  updatedAt: Date;
}

// ── Schema ───────────────────────────────────────────────────────────────────

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

const groupSchema = new Schema<IGroup>(
  {
    name: {
      type: String,
      required: [true, 'Group name is required'],
      trim: true,
      maxlength: [100, 'Group name must not exceed 100 characters'],
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Group creator is required'],
      index: true,
    },
    members: {
      type: [groupMemberSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// ── Model ────────────────────────────────────────────────────────────────────

export const Group = mongoose.model<IGroup>('Group', groupSchema);
