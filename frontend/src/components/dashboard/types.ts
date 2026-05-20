import type { LucideIcon } from 'lucide-react';

export type DashboardView = 'overview' | 'my-capsules' | 'received' | 'profile';

export type CapsuleStatus = 'locked' | 'unlocked';

export interface NavigationItem {
  id: DashboardView;
  label: string;
  icon: LucideIcon;
}

export interface MockCapsule {
  id: string;
  title: string;
  status: CapsuleStatus;
  unlockDate: string;
  sender?: string;
}

export interface MockStat {
  label: string;
  value: number;
  icon: LucideIcon;
}
