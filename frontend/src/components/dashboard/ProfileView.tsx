import { motion } from 'motion/react';
import { User, Mail, Calendar, AtSign } from 'lucide-react';
import { useUser } from '@clerk/clerk-react';

export function ProfileView() {
  const { user } = useUser();

  const formattedDate = user?.createdAt 
    ? new Date(user.createdAt).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
      })
    : 'Unknown Date';

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
        <p className="text-sm text-ink-muted mt-1">View your account details</p>
      </div>

      {/* Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05, duration: 0.35 }}
        className="bg-white border border-black/5 rounded-2xl p-6"
      >
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
          <div className="w-16 h-16 rounded-2xl bg-brand-soft flex items-center justify-center shrink-0 overflow-hidden">
            {user?.imageUrl ? (
              <img src={user.imageUrl} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <User className="w-7 h-7 text-brand" />
            )}
          </div>

          <div className="flex-1 text-center sm:text-left">
            <h3 className="text-lg font-semibold tracking-tight text-ink">
              {user?.fullName || user?.firstName || 'User'}
            </h3>

            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-2 flex-wrap justify-center sm:justify-start">
              {user?.username && (
                <span className="flex items-center justify-center sm:justify-start gap-1.5 text-sm text-ink-muted">
                  <AtSign className="w-3.5 h-3.5" />
                  {user.username}
                </span>
              )}
              {user?.primaryEmailAddress?.emailAddress && (
                <span className="flex items-center justify-center sm:justify-start gap-1.5 text-sm text-ink-muted">
                  <Mail className="w-3.5 h-3.5" />
                  {user.primaryEmailAddress.emailAddress}
                </span>
              )}
              <span className="flex items-center justify-center sm:justify-start gap-1.5 text-sm text-ink-muted">
                <Calendar className="w-3.5 h-3.5" />
                Member since {formattedDate}
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
