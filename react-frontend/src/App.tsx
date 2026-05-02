import { useState } from 'react';
import { useAuth } from './contexts/AuthContext';
import { SettingsProvider, useSettings } from './contexts/SettingsContext';
import { TestProvider } from './contexts/TestContext';
import AuthPage from './components/auth/AuthPage';
import LevelTest from './components/test/LevelTest';
import MainLayout from './components/layout/MainLayout';
import WelcomeSection from './components/dashboard/WelcomeSection';
import QuickActions from './components/dashboard/QuickActions';
import GalleryPage from './components/gallery/GalleryPage';
import MyLearningPage from './components/learning/MyLearningPage';
import PracticeHistoryPage from './components/practice/PracticeHistoryPage';
import AnkiExportPage from './components/anki/AnkiExportPage';
import SettingsPage from './components/settings/SettingsPage';
import { useLensaApp } from './hooks/useLensaApp';
import './styles/components.css';

function AppContent() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const { t } = useSettings();
  const { state, handleGenerate, handleSubmitAnswer, ankiUrl, handleDeleteCard, handleToggleComplete } = useLensaApp();
  const [activeNav, setActiveNav] = useState('home');

  const handleNavigate = (item: string) => {
    setActiveNav(item);
  };

  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>{t.loading}</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthPage />;
  }

  if (!user?.hasCompletedTest) {
    return (
      <TestProvider>
        <LevelTest onComplete={() => {}} />
      </TestProvider>
    );
  }

  return (
    <MainLayout activeNav={activeNav} onNavigate={handleNavigate}>
      {activeNav === 'home' && (
        <div className="dashboard-content">
          <WelcomeSection />

          <QuickActions
            onActionClick={(actionId) => {
              if (actionId === 'practice') handleNavigate('practice');
              else if (actionId === 'gallery') handleNavigate('gallery');
              else if (actionId === 'anki') handleNavigate('anki');
              else if (actionId === 'report') handleNavigate('practice');
              else console.log('Action clicked:', actionId);
            }}
          />
        </div>
      )}

      {activeNav === 'learning' && (
        <MyLearningPage
          onImageSelect={handleGenerate}
          resultImageUrl={state.resultImageUrl}
          isRendering={state.isRendering}
          annotations={state.annotations}
          task={state.task}
          feedback={state.feedback}
          onSubmitAnswer={handleSubmitAnswer}
          disabled={state.isGenerating || state.isRendering}
        />
      )}

      {activeNav === 'practice' && (
        <PracticeHistoryPage />
      )}

      {activeNav === 'anki' && (
        <AnkiExportPage
          ankiUrl={ankiUrl}
          userId={state.userId}
        />
      )}

      {activeNav === 'gallery' && (
        <GalleryPage
          cards={state.galleryCards}
          onDelete={handleDeleteCard}
          onToggleComplete={handleToggleComplete}
          onNavigate={handleNavigate}
        />
      )}

      {activeNav === 'settings' && (
        <SettingsPage
          cards={state.galleryCards}
          userId={state.userId}
          ankiUrl={ankiUrl}
          onNavigate={handleNavigate}
        />
      )}
    </MainLayout>
  );
}

export default function App() {
  return (
    <SettingsProvider>
      <AppContent />
    </SettingsProvider>
  );
}
