import { useState } from 'react';
import { useAuth } from './contexts/AuthContext';
import { SettingsProvider, useSettings } from './contexts/SettingsContext';
import { TestProvider } from './contexts/TestContext';
import AuthPage from './components/auth/AuthPage';
import LevelTest from './components/test/LevelTest';
import MainLayout from './components/layout/MainLayout';
import WelcomeSection from './components/dashboard/WelcomeSection';
import CameraUpload from './components/dashboard/CameraUpload';
import RecentLearning from './components/dashboard/RecentLearning';
import QuickActions from './components/dashboard/QuickActions';
import Practice from './components/Practice';
import AnkiExport from './components/AnkiExport';
import GalleryPage from './components/gallery/GalleryPage';
import { useLensaApp } from './hooks/useLensaApp';
import './styles/components.css';

function VocabularyPage() {
  return (
    <div className="page-panel">
      <div className="section-header">
        <div>
          <span className="eyebrow">Vocabulary</span>
          <h2 className="section-title">词汇本</h2>
        </div>
      </div>
      <RecentLearning />
    </div>
  );
}

function LearningPage() {
  return (
    <div className="dashboard-content">
      <WelcomeSection />
      <RecentLearning />
    </div>
  );
}

function SettingsPage({ onRetest }: { onRetest: () => void }) {
  const { language, setLanguage, languages, t } = useSettings();

  return (
    <div className="page-panel">
      <div className="section-header">
        <div>
          <span className="eyebrow">Settings</span>
          <h2 className="section-title">设置</h2>
        </div>
      </div>

      <div className="settings-grid">
        <section className="settings-card">
          <h3>界面语言</h3>
          <p>切换后会同步影响首页、统计与学习模块里的文案。</p>
          <select
            className="language-selector"
            value={language}
            onChange={(event) => setLanguage(event.target.value as typeof language)}
            aria-label={t.common.language}
          >
            {Object.entries(languages).map(([key, meta]) => (
              <option key={key} value={key}>
                {meta.label}
              </option>
            ))}
          </select>
        </section>

        <section className="settings-card">
          <h3>我的水平</h3>
          <p>重新完成水平测评后，侧边栏会展示最新的 CEFR 等级。</p>
          <button className="action-button compact" onClick={onRetest}>
            重新测评
          </button>
        </section>
      </div>
    </div>
  );
}

function AppContent() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const { t } = useSettings();
  const { state, dispatch, handleGenerate, handleSubmitAnswer, ankiUrl } = useLensaApp();
  const [activeNav, setActiveNav] = useState('home');
  const [showLevelTest, setShowLevelTest] = useState(false);

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

  if (!user?.hasCompletedTest || showLevelTest) {
    return (
      <TestProvider>
        <LevelTest onComplete={() => {
          setShowLevelTest(false);
          setActiveNav('home');
        }} />
      </TestProvider>
    );
  }

  const renderPage = () => {
    switch (activeNav) {
      case 'learning':
        return <LearningPage />;
      case 'practice':
        return (
          <div className="page-panel">
            <div className="section-header">
              <div>
                <span className="eyebrow">Practice</span>
                <h2 className="section-title">练习记录</h2>
              </div>
            </div>
            <Practice
              task={state.task}
              feedback={state.feedback}
              onSubmit={handleSubmitAnswer}
              disabled={state.isGenerating || state.isRendering}
            />
          </div>
        );
      case 'vocabulary':
        return <VocabularyPage />;
      case 'gallery':
        return (
          <GalleryPage
            cards={state.galleryCards}
            onDelete={(id) => dispatch({ type: 'REMOVE_GALLERY_CARD', payload: id })}
            onToggleComplete={(id) => dispatch({ type: 'TOGGLE_GALLERY_CARD_COMPLETE', payload: id })}
            onNavigate={setActiveNav}
          />
        );
      case 'anki':
        return (
          <div className="page-panel">
            <div className="section-header">
              <div>
                <span className="eyebrow">Anki</span>
                <h2 className="section-title">Anki 导出</h2>
              </div>
            </div>
            <AnkiExport ankiUrl={ankiUrl} userId={state.userId} />
          </div>
        );
      case 'settings':
      case 'profile':
        return <SettingsPage onRetest={() => setShowLevelTest(true)} />;
      case 'home':
      default:
        return (
          <div className="dashboard-content">
            <WelcomeSection />
            <CameraUpload
              onCapture={handleGenerate}
              disabled={false}
            />
            <RecentLearning />
            <QuickActions onActionClick={setActiveNav} />
          </div>
        );
    }
  };

  return (
    <MainLayout activeNav={activeNav} onNavigate={setActiveNav}>
      {renderPage()}
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
