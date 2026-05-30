import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getFallbackUsername(user: any): string {
  if (!user) return 'user';
  return user.username || user.primaryEmailAddress?.emailAddress?.split('@')[0] || `user_${user.id.slice(-6)}`;
}

