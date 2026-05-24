import { motion } from 'motion/react';
import { User, Mail, Calendar, Pencil, Bell, Shield, Link2, Trash2, ChevronRight } from 'lucide-react';

const SETTINGS_ITEMS = [
  { icon: Bell, label: 'Email Notifications', hasToggle: true, destructive: false },
  { icon: Shield, label: 'Privacy Settings', hasToggle: false, destructive: false },
  { icon: Link2, label: 'Connected Accounts', hasToggle: false, destructive: false },
  { icon: Trash2, label: 'Delete Account', hasToggle: false, destructive: true },
];

export function ProfileView() {
  return (
    <motion.div
      key="profile"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 max-w-2xl"
    >
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-ink">Profile</h2>
        <p className="text-sm text-ink-muted mt-1">Manage your account and preferences</p>
      </div>

      {/* Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05, duration: 0.35 }}
        className="bg-white border border-black/5 rounded-2xl p-6"
      >
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
          <div className="w-16 h-16 rounded-2xl bg-brand-soft flex items-center justify-center shrink-0">
            <User className="w-7 h-7 text-brand" />
          </div>

          <div className="flex-1 text-center sm:text-left">
            <h3 className="text-lg font-semibold tracking-tight text-ink">Your Name</h3>

            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-1.5">
              <span className="flex items-center justify-center sm:justify-start gap-1.5 text-sm text-ink-muted">
                <Mail className="w-3.5 h-3.5" />
                yourname@email.com
              </span>
              <span className="flex items-center justify-center sm:justify-start gap-1.5 text-sm text-ink-muted">
                <Calendar className="w-3.5 h-3.5" />
                Member since May 2026
              </span>
            </div>

            <button
              id="edit-profile"
              disabled
              className="mt-4 flex items-center gap-1.5 px-4 py-2 rounded-xl bg-paper border border-black/5 text-xs font-medium text-ink-muted cursor-not-allowed opacity-50 mx-auto sm:mx-0"
            >
              <Pencil className="w-3.5 h-3.5" />
              Edit Profile
            </button>
          </div>
        </div>
      </motion.div>

      {/* Settings */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.35 }}
        className="bg-white border border-black/5 rounded-2xl overflow-hidden"
      >
        <div className="px-6 pt-5 pb-2">
          <span className="text-[10px] uppercase font-semibold tracking-wider text-ink-muted">Account Settings</span>
        </div>

        <div className="divide-y divide-black/5">
          {SETTINGS_ITEMS.map((item) => (
            <button
              key={item.label}
              className="w-full flex items-center gap-3.5 px-6 py-3.5 hover:bg-paper/80 transition-colors duration-150"
            >
              <item.icon
                className={`w-[17px] h-[17px] shrink-0 ${item.destructive ? 'text-red-400' : 'text-ink-muted'}`}
              />
              <span
                className={`flex-1 text-left text-sm font-medium ${item.destructive ? 'text-red-500' : 'text-ink'}`}
              >
                {item.label}
              </span>

              {item.hasToggle ? (
                <div className="w-9 h-[22px] rounded-full bg-brand relative">
                  <div className="absolute right-0.5 top-[3px] w-4 h-4 rounded-full bg-white shadow-sm" />
                </div>
              ) : (
                <ChevronRight className="w-4 h-4 text-ink-muted/50" />
              )}
            </button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
