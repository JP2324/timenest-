import type { LucideIcon } from 'lucide-react';

export type DashboardView = 'overview' | 'my-capsules' | 'received' | 'profile';

export type CapsuleStatus = 'locked' | 'unlocked';

export type CapsuleType = 'time' | 'group' | 'location';

export interface Capsule {
  _id: string;
  creator: string;
  title: string;
  message?: string;
  mediaUrls: string[];
  capsuleType: CapsuleType;
  status: CapsuleStatus;
  recipients: string[];
  unlockDate?: string;
  isOpened: boolean;
  openedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NavigationItem {
  id: DashboardView;
  label: string;
  icon: LucideIcon;
}
