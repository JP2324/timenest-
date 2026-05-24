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

export default function DashboardPage() {
  const [activeView, setActiveView] = useState<DashboardView>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);
  const openModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);

  return (
    <div className="h-screen bg-paper flex overflow-hidden">
      <Sidebar
        activeView={activeView}
        onViewChange={setActiveView}
        onCreateCapsule={openModal}
        isOpen={sidebarOpen}
        onToggle={toggleSidebar}
      />

      <main className="flex-1 flex flex-col h-screen min-w-0">
        <TopBar activeView={activeView} />

        <div className="flex-1 overflow-y-auto p-5 md:p-7">
          <AnimatePresence mode="wait">
            {activeView === 'overview' && (
              <OverviewView onCreateCapsule={openModal} />
            )}
            {activeView === 'my-capsules' && (
              <MyCapsulesView onCreateCapsule={openModal} />
            )}
            {activeView === 'received' && (
              <ReceivedCapsulesView />
            )}
            {activeView === 'profile' && (
              <ProfileView />
            )}
          </AnimatePresence>
        </div>
      </main>

      <CreateCapsuleModal isOpen={modalOpen} onClose={closeModal} />
    </div>
  );
}
