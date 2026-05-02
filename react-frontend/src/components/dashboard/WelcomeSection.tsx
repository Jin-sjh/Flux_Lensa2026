import { useSettings } from '../../contexts/SettingsContext';
import { useResponsive } from '../../hooks/useResponsive';

export default function WelcomeSection() {
  const { isMobile: _isMobile } = useResponsive();
  const { language, t } = useSettings();

  return (
    <section className="welcome-section">
      <div className="welcome-header">
        <div className="welcome-text">
          <span className="eyebrow">{t.welcome.eyebrow}</span>
          <h1 className={`welcome-title welcome-title-${language}`}>{t.welcome.title}</h1>
          <p className="welcome-subtitle">{t.welcome.subtitle}</p>
        </div>
      </div>

      <div className="hero-metrics" aria-label={t.welcome.overview}>
        <div className="hero-metric">
          <strong>24 min</strong>
          <span>{t.welcome.immersion}</span>
        </div>
        <div className="hero-metric">
          <strong>128</strong>
          <span>{t.welcome.words}</span>
        </div>
        <div className="hero-metric">
          <strong>87%</strong>
          <span>{t.welcome.accuracy}</span>
        </div>
      </div>
    </section>
  );
}
