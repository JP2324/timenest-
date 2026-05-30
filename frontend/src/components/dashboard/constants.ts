import {
  Archive,
  Mail,
  User,
  LayoutDashboard,
  LockKeyhole,
  FileText,
  Image as ImageIcon,
} from 'lucide-react';
import type { NavigationItem } from './types';

export const NAVIGATION_ITEMS: NavigationItem[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'my-capsules', label: 'My Capsules', icon: Archive },
  { id: 'received', label: 'Received Capsules', icon: Mail },
  { id: 'profile', label: 'Profile', icon: User },
];

export const VIEW_TITLES: Record<string, string> = {
  overview: 'Overview',
  'my-capsules': 'My Capsules',
  received: 'Received Capsules',
  profile: 'Profile',
};

export const CREATE_CAPSULE_STEPS = [
  { number: 1, label: 'Message Details', icon: FileText },
  { number: 2, label: 'Memories & Media', icon: ImageIcon },
  { number: 3, label: 'Unlock Conditions', icon: LockKeyhole },
];

export const FILTER_TABS = ['All', 'Locked', 'Unlocked'] as const;

