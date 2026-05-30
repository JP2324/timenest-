import type { LucideIcon } from 'lucide-react';

export type DashboardView = 'overview' | 'my-capsules' | 'received' | 'profile';

export type CapsuleStatus = 'locked' | 'unlocked';

export interface NavigationItem {
  id: DashboardView;
  label: string;
  icon: LucideIcon;
}
