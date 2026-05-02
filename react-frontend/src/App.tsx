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
import { useLensaApp } from './hooks/useLensaApp';
import './styles/components.css';
import Practice from './components/Practice';

function AppContent() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const { t } = useSettings();
  const { state, handleGenerate, handleSubmitAnswer } = useLensaApp();

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

  // ← 新增：生成成功后显示练习页面
  if (state.phase === 'practice') {
    return (
      <MainLayout>
        <div className="dashboard-content">
          <p className="status-text">{state.status}</p>
          {state.resultImageUrl && (
            <img src={state.resultImageUrl} alt="学习卡片" style={{ width: '100%', borderRadius: 12 }} />
          )}
          <Practice
            task={state.task}
            feedback={state.feedback}
            onSubmit={handleSubmitAnswer}
            disabled={state.isRendering}
          />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="dashboard-content">
        <WelcomeSection />
        <CameraUpload
          onCapture={handleGenerate}
          disabled={state.isGenerating}  // ← 生成中禁用按钮
        />
        {state.isGenerating && <p className="status-text">{state.status}</p>}
        <RecentLearning />
        <QuickActions
          onActionClick={(actionId) => {
            console.log('Action clicked:', actionId);
          }}
        />
      </div>
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
