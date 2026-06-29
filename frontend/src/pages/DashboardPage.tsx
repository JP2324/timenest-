import { useState } from 'react';
import { AnimatePresence } from 'motion/react';
import { Sidebar } from '../components/dashboard/Sidebar';
import { TopBar } from '../components/dashboard/TopBar';
import { OverviewView } from '../components/dashboard/OverviewView';
import { MyCapsulesView } from '../components/dashboard/MyCapsulesView';
import { ReceivedCapsulesView } from '../components/dashboard/ReceivedCapsulesView';
import { ProfileView } from '../components/dashboard/ProfileView';
import { CreateCapsuleModal } from '../components/dashboard/CreateCapsuleModal';
import { CapsuleDetailView } from '../components/dashboard/CapsuleDetailView';
import type { DashboardView } from '../components/dashboard/types';
import { useUserSync } from '../hooks/useUserSync';
import { useCapsules } from '../hooks/useCapsules';
import { useNotifications } from '../hooks/useNotifications';

export default function DashboardPage() {
  useUserSync();
  const { myCapsules, receivedCapsules, isLoading, isRefreshing, refetch, unlockedNotificationCount } = useCapsules();

  const { notifications, unreadCount, markAsRead, markAllAsRead, refetch: refetchNotifications } = useNotifications();

  const [activeView, setActiveView] = useState<DashboardView>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [viewCapsuleId, setViewCapsuleId] = useState<string | null>(null);

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);
  const openModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);

  const handleCapsuleCreated = () => {
    refetch();
    refetchNotifications();
  };

  const handleViewCapsule = (capsuleId: string) => {
    setViewCapsuleId(capsuleId);
  };

  const handleBackFromDetail = () => {
    setViewCapsuleId(null);
  };

  // When switching sidebar views, also clear any open capsule detail
  const handleViewChange = (view: DashboardView) => {
    setViewCapsuleId(null);
    setActiveView(view);
  };

  return (
    <div className="h-screen bg-paper flex overflow-hidden">
      <Sidebar
        activeView={activeView}
        onViewChange={handleViewChange}
        onCreateCapsule={openModal}
        isOpen={sidebarOpen}
        onToggle={toggleSidebar}
        notificationCount={unlockedNotificationCount}
      />

      <main className="flex-1 flex flex-col h-screen min-w-0">
        <TopBar
          activeView={activeView}
          onRefresh={refetch}
          isRefreshing={isRefreshing}
          notifications={notifications}
          unreadCount={unreadCount}
          onMarkAsRead={markAsRead}
          onMarkAllAsRead={markAllAsRead}
        />

        <div className="flex-1 overflow-y-auto p-5 md:p-7">
          <AnimatePresence mode="wait">
            {/* Capsule detail view replaces the normal panel content */}
            {viewCapsuleId ? (
              <CapsuleDetailView
                capsuleId={viewCapsuleId}
                onBack={handleBackFromDetail}
              />
            ) : (
              <>
                {activeView === 'overview' && (
                  <OverviewView
                    onCreateCapsule={openModal}
                    onViewCapsule={handleViewCapsule}
                    myCapsules={myCapsules}
                    receivedCapsules={receivedCapsules}
                    isLoading={isLoading}
                    onRefetch={refetch}
                  />
                )}
                {activeView === 'my-capsules' && (
                  <MyCapsulesView
                    onCreateCapsule={openModal}
                    onViewCapsule={handleViewCapsule}
                    capsules={myCapsules}
                    isLoading={isLoading}
                    onRefetch={refetch}
                  />
                )}
                {activeView === 'received' && (
                  <ReceivedCapsulesView
                    onViewCapsule={handleViewCapsule}
                    capsules={receivedCapsules}
                    isLoading={isLoading}
                    onRefetch={refetch}
                  />
                )}
                {activeView === 'profile' && (
                  <ProfileView />
                )}
              </>
            )}
          </AnimatePresence>
        </div>
      </main>

      <CreateCapsuleModal
        isOpen={modalOpen}
        onClose={closeModal}
        onCapsuleCreated={handleCapsuleCreated}
      />
    </div>
  );
}
