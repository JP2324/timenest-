import { useState, useRef, useEffect } from 'react';
import { UserButton } from '@clerk/clerk-react';
import { Bell, Search, RefreshCw, Users, CheckCheck } from 'lucide-react';
import { VIEW_TITLES } from './constants';
import type { DashboardView, AppNotification } from './types';

interface TopBarProps {
  activeView: DashboardView;
  onRefresh: () => void;
  isRefreshing: boolean;
  notifications: AppNotification[];
  unreadCount: number;
  onMarkAsRead: (notificationId: string) => Promise<void>;
  onMarkAllAsRead: () => Promise<void>;
}

/**
 * Formats a date string into a relative time display (e.g., "2m ago", "1h ago").
 */
const formatRelativeTime = (dateString: string): string => {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);

  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export function TopBar({ activeView, onRefresh, isRefreshing, notifications, unreadCount, onMarkAsRead, onMarkAllAsRead }: TopBarProps) {
  const title = VIEW_TITLES[activeView] ?? 'Dashboard';
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDropdownOpen]);

  const handleNotificationClick = async (notification: AppNotification) => {
    if (!notification.isRead) {
      await onMarkAsRead(notification._id);
    }
  };

  return (
    <div className="shrink-0">
      {/* Main header row */}
      <header className="sticky top-0 z-30 bg-white border-b border-black/5 px-6 py-3.5 flex items-center justify-between gap-4">
        {/* Left: Title (with mobile spacer) */}
        <div className="flex items-center gap-3">
          <div className="w-10 md:w-0 shrink-0" />
          <h1 className="text-xl font-semibold tracking-tight text-ink">{title}</h1>
        </div>

        {/* Center: Search (desktop only) */}
        <div className="hidden md:flex items-center flex-1 max-w-sm mx-auto">
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-paper border border-black/5 text-sm text-ink placeholder:text-ink-muted focus:outline-none focus:border-black/10 transition-colors"
            />
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          <button
            id="dashboard-refresh"
            onClick={onRefresh}
            disabled={isRefreshing}
            title="Refresh capsules"
            className="w-9 h-9 flex items-center justify-center rounded-xl border border-black/5 text-ink-muted hover:text-ink hover:border-black/10 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw
              className={`w-4 h-4 transition-transform duration-200 ${isRefreshing ? 'animate-spin' : ''}`}
            />
          </button>

          {/* Notification Bell with Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              id="notification-bell"
              onClick={() => setIsDropdownOpen((prev) => !prev)}
              className="w-9 h-9 flex items-center justify-center rounded-xl border border-black/5 text-ink-muted hover:text-ink hover:border-black/10 transition-colors duration-200 relative"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center leading-none">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Dropdown Panel */}
            {isDropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-black/5 rounded-2xl shadow-xl overflow-hidden z-50">
                {/* Header */}
                <div className="px-4 py-3 border-b border-black/5 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-ink">Notifications</h3>
                  {unreadCount > 0 && (
                    <button
                      onClick={onMarkAllAsRead}
                      className="flex items-center gap-1 text-[11px] font-medium text-brand hover:text-brand-light transition-colors"
                    >
                      <CheckCheck className="w-3 h-3" />
                      Mark all read
                    </button>
                  )}
                </div>

                {/* Notification List */}
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="px-4 py-8 text-center">
                      <Bell className="w-5 h-5 text-ink-muted/40 mx-auto mb-2" />
                      <p className="text-xs text-ink-muted">No notifications yet</p>
                    </div>
                  ) : (
                    notifications.map((notification) => (
                      <button
                        key={notification._id}
                        onClick={() => handleNotificationClick(notification)}
                        className={`w-full text-left px-4 py-3 border-b border-black/[0.03] hover:bg-paper/60 transition-colors duration-150 ${
                          !notification.isRead ? 'bg-brand-soft/20' : ''
                        }`}
                      >
                        <div className="flex gap-3 items-start">
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                            !notification.isRead ? 'bg-brand-soft text-brand' : 'bg-paper text-ink-muted'
                          }`}>
                            <Users className="w-3.5 h-3.5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-xs leading-relaxed ${
                              !notification.isRead ? 'text-ink font-medium' : 'text-ink-muted'
                            }`}>
                              {notification.message}
                            </p>
                            <p className="text-[10px] text-ink-muted/60 mt-0.5">
                              {formatRelativeTime(notification.createdAt)}
                            </p>
                          </div>
                          {!notification.isRead && (
                            <div className="w-2 h-2 rounded-full bg-brand shrink-0 mt-1.5" />
                          )}
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <UserButton afterSignOutUrl="/" />
        </div>
      </header>

      {/* Mobile search bar — visible below md only */}
      <div className="md:hidden px-5 py-3 border-b border-black/5 bg-white">
        <div className="relative w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted" />
          <input
            type="text"
            placeholder="Search..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-paper border border-black/5 text-sm text-ink placeholder:text-ink-muted focus:outline-none focus:border-black/10 transition-colors shadow-sm"
          />
        </div>
      </div>
    </div>
  );
}
