import { useSettings } from '../../contexts/SettingsContext';
import { useResponsive } from '../../hooks/useResponsive';

interface WelcomeSectionProps {
  variant?: 'default' | 'lite';
}

export default function WelcomeSection({ variant = 'default' }: WelcomeSectionProps) {
  const { isMobile: _isMobile } = useResponsive();
  const { language, t } = useSettings();

  return (
    <section className={`welcome-section ${variant === 'lite' ? 'welcome-section-lite' : ''}`}>
      <div className="welcome-artistic-elements">
        <div className="floating-element element-1"></div>
        <div className="floating-element element-2"></div>
        <div className="floating-element element-3"></div>
        <div className="geometric-pattern"></div>
        <div className="gradient-orb orb-1"></div>
        <div className="gradient-orb orb-2"></div>
      </div>

      <div className="welcome-header">
        <div className="welcome-text">
          <div className="eyebrow-wrapper">
            <span className="eyebrow">{t.welcome.eyebrow}</span>
            <div className="eyebrow-decoration"></div>
          </div>
          
          <h1 className={`welcome-title welcome-title-${language}`}>
            {t.welcome.title}
          </h1>
          
          <div className="title-underline">
            <div className="underline-segment"></div>
            <div className="underline-dot"></div>
          </div>
          
          <p className="welcome-subtitle">{t.welcome.subtitle}</p>
          
          <div className="welcome-cta">
            <button className="cta-primary">
              <span>开始学习</span>
              <span className="cta-icon">→</span>
            </button>
            <button className="cta-secondary">
              <span>了解更多</span>
            </button>
          </div>
        </div>

        <div className="welcome-visual">
          <div className="visual-card card-1">
            <div className="card-icon">🌍</div>
            <div className="card-content">
              <div className="card-title">沉浸式学习</div>
              <div className="card-desc">用真实场景学习语言</div>
            </div>
          </div>
          <div className="visual-card card-2">
            <div className="card-icon">📸</div>
            <div className="card-content">
              <div className="card-title">智能识别</div>
              <div className="card-desc">拍照即可学习词汇</div>
            </div>
          </div>
          <div className="visual-card card-3">
            <div className="card-icon">🎯</div>
            <div className="card-content">
              <div className="card-title">个性化路径</div>
              <div className="card-desc">定制你的学习计划</div>
            </div>
          </div>
        </div>
      </div>

      {variant === 'default' && (
        <div className="hero-metrics" aria-label={t.welcome.overview}>
          <div className="hero-metric">
            <div className="metric-icon-wrapper">
              <span className="metric-icon">⏱</span>
            </div>
            <div className="metric-content">
              <strong>24 min</strong>
              <span>{t.welcome.immersion}</span>
            </div>
            <div className="metric-decoration"></div>
          </div>
          
          <div className="hero-metric">
            <div className="metric-icon-wrapper">
              <span className="metric-icon">📚</span>
            </div>
            <div className="metric-content">
              <strong>128</strong>
              <span>{t.welcome.words}</span>
            </div>
            <div className="metric-decoration"></div>
          </div>
          
          <div className="hero-metric">
            <div className="metric-icon-wrapper">
              <span className="metric-icon">✨</span>
            </div>
            <div className="metric-content">
              <strong>87%</strong>
              <span>{t.welcome.accuracy}</span>
            </div>
            <div className="metric-decoration"></div>
          </div>
        </div>
      )}
    </section>
  );
}
