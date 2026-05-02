import { useState } from 'react';
import type { ReactNode } from 'react';
import { useResponsive } from '../../hooks/useResponsive';
import Sidebar from './Sidebar';
import Header from './Header';
import TopBar from './TopBar';
import BottomNav from './BottomNav';
import MobileDrawer from './MobileDrawer';
import StatsPanel from '../dashboard/StatsPanel';
import '../../styles/layout.css';

interface MainLayoutProps {
  children: ReactNode;
  activeNav?: string;
  onNavigate?: (item: string) => void;
}

export default function MainLayout({ children, activeNav = 'home', onNavigate }: MainLayoutProps) {
  const { isMobile, isDesktop } = useResponsive();
  const handleNavigate = onNavigate ?? (() => {});
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className={`app-layout ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      {isDesktop && (
        <Sidebar
          activeItem={activeNav}
          onNavigate={handleNavigate}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />
      )}
      {isMobile && (
        <>
          <Header onMenuClick={() => setIsDrawerOpen(true)} />
          <MobileDrawer
            isOpen={isDrawerOpen}
            onClose={() => setIsDrawerOpen(false)}
            activeItem={activeNav}
            onNavigate={handleNavigate}
          />
        </>
      )}

      {!isMobile && <TopBar isSidebarCollapsed={isSidebarCollapsed} />}

      <main className={`main-content ${isDesktop ? 'with-sidebar' : ''} ${isMobile ? 'with-header' : ''} ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        {children}
      </main>

      {isDesktop && <StatsPanel />}
      {isMobile && <BottomNav activeTab={activeNav} onTabChange={handleNavigate} />}
    </div>
  );
}
