import {
  Archive,
  Mail,
  User,
  LayoutDashboard,
  LockKeyhole,
  LockOpen,
  FileText,
  Image as ImageIcon,
} from 'lucide-react';
import type { NavigationItem, MockCapsule, MockStat } from './types';

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

export const MOCK_STATS: MockStat[] = [
  { label: 'Capsules Created', value: 3, icon: LockKeyhole },
  { label: 'Received Capsules', value: 1, icon: Mail },
  { label: 'Unlocking Soon', value: 2, icon: LockOpen },
];

export const MOCK_MY_CAPSULES: MockCapsule[] = [
  { id: '1', title: 'Letter to Future Me', status: 'locked', unlockDate: 'May 15, 2030' },
  { id: '2', title: 'Our Graduation Day', status: 'locked', unlockDate: 'June 1, 2028' },
  { id: '3', title: 'Family Memories 2025', status: 'unlocked', unlockDate: 'Jan 1, 2026' },
  { id: '4', title: 'Summer Road Trip', status: 'locked', unlockDate: 'Aug 20, 2029' },
  { id: '5', title: 'New Year Resolutions', status: 'unlocked', unlockDate: 'Dec 31, 2025' },
  { id: '6', title: 'Wedding Anniversary', status: 'locked', unlockDate: 'Sep 14, 2031' },
];

export const MOCK_RECENT_CAPSULES: MockCapsule[] = MOCK_MY_CAPSULES.slice(0, 4);

export const MOCK_RECEIVED_CAPSULES: MockCapsule[] = [
  { id: 'r1', title: 'From Mom — Birthday 2026', status: 'locked', unlockDate: 'Oct 12, 2026', sender: 'Sarah M.' },
  { id: 'r2', title: 'Team Farewell Note', status: 'unlocked', unlockDate: 'Mar 30, 2026', sender: 'Alex K.' },
  { id: 'r3', title: 'Grandpa\'s Stories', status: 'locked', unlockDate: 'Dec 25, 2027', sender: 'Robert J.' },
];

export const CREATE_CAPSULE_STEPS = [
  { number: 1, label: 'Message Details', icon: FileText },
  { number: 2, label: 'Memories & Media', icon: ImageIcon },
  { number: 3, label: 'Unlock Conditions', icon: LockKeyhole },
];

export const FILTER_TABS = ['All', 'Locked', 'Unlocked'] as const;
