import { useState, useEffect, useRef } from 'react';
import { useAuth } from './stores/authStore';
import { useSettings } from './stores/settingsStore';
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
import VocabularyPage from './components/vocabulary/VocabularyPage';
import { useLensaApp } from './hooks/useLensaApp';
import './styles/components.css';

function AppContent() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const { t } = useSettings();
  const {
    state,
    handleGenerate,
    handleSubmitAnswer,
    ankiUrl,
    handleDeleteCard,
    handleToggleComplete,
    handleUpdateCaption,
    handleCompleteSession,
    loadSessions,
    loadVocabulary,
  } = useLensaApp();
  const [activeNav, setActiveNav] = useState('home');
  const imageUploaderRef = useRef<HTMLDivElement>(null);
  const [shouldScrollToUploader, setShouldScrollToUploader] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user) {
      loadSessions();
      loadVocabulary();
    }
  }, [isAuthenticated, user, loadSessions, loadVocabulary]);

  useEffect(() => {
    if (shouldScrollToUploader && activeNav === 'learning' && imageUploaderRef.current) {
      setTimeout(() => {
        imageUploaderRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setShouldScrollToUploader(false);
      }, 100);
    }
  }, [shouldScrollToUploader, activeNav]);

  const handleNavigate = (item: string, scrollToUploader?: boolean) => {
    setActiveNav(item);
    if (scrollToUploader) {
      setShouldScrollToUploader(true);
    }
    if (state.phase === 'completed') {
      state.phase = 'upload';
    }
  };

  const handleStartLearning = () => {
    handleNavigate('learning', true);
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
    return <LevelTest onComplete={() => {}} />;
  }

  return (
    <MainLayout activeNav={activeNav} onNavigate={handleNavigate}>
      {activeNav === 'home' && (
        <div className="dashboard-content">
          <WelcomeSection onStartLearning={handleStartLearning} />
          <QuickActions
            onActionClick={(actionId) => {
              if (actionId === 'practice') handleNavigate('learning');
              else if (actionId === 'gallery') handleNavigate('gallery');
              else if (actionId === 'anki') handleNavigate('anki');
              else if (actionId === 'vocabulary') handleNavigate('vocabulary');
              else if (actionId === 'report') handleNavigate('practice');
              else console.log('Action clicked:', actionId);
            }}
          />
        </div>
      )}

      {activeNav === 'learning' && (
        <MyLearningPage
          ref={imageUploaderRef}
          onImageSelect={handleGenerate}
          resultImageUrl={state.resultImageUrl}
          isRendering={state.isRendering}
          annotations={state.annotations}
          task={state.task}
          feedback={state.feedback}
          onSubmitAnswer={handleSubmitAnswer}
          onCompleteSession={handleCompleteSession}
          disabled={state.isGenerating || state.isRendering}
          phase={state.phase}
          status={state.status}
          caption={state.caption}
        />
      )}

      {activeNav === 'practice' && (
        <PracticeHistoryPage
          practiceRecords={state.practiceRecords}
          isLoading={state.isLoadingSessions}
        />
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
          onUpdateCaption={handleUpdateCaption}
          onNavigate={handleNavigate}
        />
      )}

      {activeNav === 'vocabulary' && (
        <VocabularyPage
          vocabularyItems={state.vocabularyItems}
          isLoading={state.isLoadingVocabulary}
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
  return <AppContent />;
}
