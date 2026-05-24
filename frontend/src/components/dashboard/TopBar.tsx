import { UserButton } from '@clerk/clerk-react';
import { Bell, Search } from 'lucide-react';
import { VIEW_TITLES } from './constants';
import type { DashboardView } from './types';

interface TopBarProps {
  activeView: DashboardView;
}

export function TopBar({ activeView }: TopBarProps) {
  const title = VIEW_TITLES[activeView] ?? 'Dashboard';

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
            id="notification-bell"
            className="w-9 h-9 flex items-center justify-center rounded-xl border border-black/5 text-ink-muted hover:text-ink hover:border-black/10 transition-colors duration-200"
          >
            <Bell className="w-4 h-4" />
          </button>
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
