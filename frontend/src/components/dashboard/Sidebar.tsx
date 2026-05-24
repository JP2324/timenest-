import { motion } from 'motion/react';
import { Lock, Plus, Menu, X, LogOut } from 'lucide-react';
import { useClerk } from '@clerk/clerk-react';
import { cn } from '../../lib/utils';
import { NAVIGATION_ITEMS } from './constants';
import type { DashboardView } from './types';

interface SidebarProps {
  activeView: DashboardView;
  onViewChange: (view: DashboardView) => void;
  onCreateCapsule: () => void;
  isOpen: boolean;
  onToggle: () => void;
}

export function Sidebar({ activeView, onViewChange, onCreateCapsule, isOpen, onToggle }: SidebarProps) {
  const { signOut } = useClerk();

  const handleSignOut = () => {
    signOut({ redirectUrl: '/' });
  };

  const handleNavClick = (view: DashboardView) => {
    onViewChange(view);
    if (isOpen) onToggle();
  };

  return (
    <>
      {/* Mobile hamburger */}
      <button
        id="sidebar-toggle"
        onClick={onToggle}
        className="fixed top-4 left-4 z-50 md:hidden w-10 h-10 flex items-center justify-center bg-brand text-white rounded-xl shadow-md"
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile overlay */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-40 bg-black/30 md:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-screen w-[250px] bg-brand flex flex-col transition-transform duration-300 ease-in-out",
          "md:translate-x-0 md:static md:z-auto",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Brand */}
        <div className="px-5 pt-7 pb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center">
              <Lock className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold tracking-tight text-[17px] text-white">TimeNest</span>
          </div>
        </div>

        {/* Create Capsule */}
        <div className="px-4 pb-5">
          <button
            id="sidebar-create-capsule"
            onClick={onCreateCapsule}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white text-brand rounded-xl text-[13px] font-semibold hover:bg-white/90 active:scale-[0.98] transition-all duration-200"
          >
            <Plus className="w-4 h-4" />
            Create Capsule
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 space-y-0.5">
          {NAVIGATION_ITEMS.map((item) => (
            <button
              key={item.id}
              id={`nav-${item.id}`}
              onClick={() => handleNavClick(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-colors duration-200",
                activeView === item.id
                  ? "bg-white/15 text-white"
                  : "text-white/60 hover:text-white hover:bg-white/8"
              )}
            >
              <item.icon className="w-[18px] h-[18px]" />
              {item.label}
            </button>
          ))}
        </nav>

        {/* Logout */}
        <div className="px-3 pb-5 pt-3">
          <button
            id="sidebar-logout"
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium text-white/50 hover:text-white hover:bg-white/8 transition-colors duration-200"
          >
            <LogOut className="w-[18px] h-[18px]" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
