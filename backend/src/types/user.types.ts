/**
 * Payload sent from the frontend to sync a Clerk user into MongoDB.
 * Mirrors the fields extracted from Clerk's `useUser()` hook.
 */
export interface ClerkUserPayload {
  clerkId: string;
  email: string;
  username: string;
  firstName?: string | null;
  lastName?: string | null;
  fullName?: string | null;
  imageUrl?: string | null;
}
