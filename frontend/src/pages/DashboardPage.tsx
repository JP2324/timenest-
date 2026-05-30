import { useState } from 'react';
import { AnimatePresence } from 'motion/react';
import { Sidebar } from '../components/dashboard/Sidebar';
import { TopBar } from '../components/dashboard/TopBar';
import { OverviewView } from '../components/dashboard/OverviewView';
import { MyCapsulesView } from '../components/dashboard/MyCapsulesView';
import { ReceivedCapsulesView } from '../components/dashboard/ReceivedCapsulesView';
import { ProfileView } from '../components/dashboard/ProfileView';
import { CreateCapsuleModal } from '../components/dashboard/CreateCapsuleModal';
import type { DashboardView } from '../components/dashboard/types';
import { useUserSync } from '../hooks/useUserSync';
import { useCapsules } from '../hooks/useCapsules';

export default function DashboardPage() {
  useUserSync();
  const { myCapsules, receivedCapsules, isLoading, refetch, unlockedNotificationCount } = useCapsules();

  const [activeView, setActiveView] = useState<DashboardView>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);
  const openModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);

  const handleCapsuleCreated = () => {
    refetch();
  };

  return (
    <div className="h-screen bg-paper flex overflow-hidden">
      <Sidebar
        activeView={activeView}
        onViewChange={setActiveView}
        onCreateCapsule={openModal}
        isOpen={sidebarOpen}
        onToggle={toggleSidebar}
        notificationCount={unlockedNotificationCount}
      />

      <main className="flex-1 flex flex-col h-screen min-w-0">
        <TopBar activeView={activeView} />

        <div className="flex-1 overflow-y-auto p-5 md:p-7">
          <AnimatePresence mode="wait">
            {activeView === 'overview' && (
              <OverviewView
                onCreateCapsule={openModal}
                myCapsules={myCapsules}
                receivedCapsules={receivedCapsules}
                isLoading={isLoading}
              />
            )}
            {activeView === 'my-capsules' && (
              <MyCapsulesView
                onCreateCapsule={openModal}
                capsules={myCapsules}
                isLoading={isLoading}
              />
            )}
            {activeView === 'received' && (
              <ReceivedCapsulesView
                capsules={receivedCapsules}
                isLoading={isLoading}
              />
            )}
            {activeView === 'profile' && (
              <ProfileView />
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
