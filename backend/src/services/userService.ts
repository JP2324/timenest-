import { User } from '../models/user.model';
import type { IUser } from '../models/user.model';
import type { ClerkUserPayload } from '../types/user.types';

/**
 * Upserts a user document keyed on `clerkId`.
 * Creates a new record on first sign-up; updates on subsequent sign-ins.
 */
export const upsertUser = async (payload: ClerkUserPayload): Promise<IUser> => {
  const { clerkId, email, username, firstName, lastName, fullName, imageUrl } = payload;

  const user = await User.findOneAndUpdate(
    { clerkId },
    {
      $set: {
        email,
        username,
        firstName: firstName ?? undefined,
        lastName: lastName ?? undefined,
        fullName: fullName ?? undefined,
        imageUrl: imageUrl ?? undefined,
      },
    },
    { new: true, upsert: true, runValidators: true }
  );

  return user;
};

/**
 * Retrieves a single user by their Clerk ID.
 * Returns `null` if no matching document exists.
 */
export const getUserByClerkId = async (clerkId: string): Promise<IUser | null> => {
  const user = await User.findOne({ clerkId });
  return user;
};
