import { useSettings } from '../../stores/settingsStore';

interface ActionCard {
  id: string;
  icon: string;
  titleKey: 'practiceTitle' | 'ankiTitle' | 'reportTitle' | 'galleryTitle';
  descriptionKey: 'practiceDesc' | 'ankiDesc' | 'reportDesc' | 'galleryDesc';
  buttonKey: 'practiceButton' | 'ankiButton' | 'reportButton' | 'galleryButton';
  gradient: string;
  iconBg: string;
}

const actions: ActionCard[] = [
  {
    id: 'practice',
    icon: 'Quiz',
    titleKey: 'practiceTitle',
    descriptionKey: 'practiceDesc',
    buttonKey: 'practiceButton',
    gradient: 'linear-gradient(135deg, #f2f8ec, #fff7dc)',
    iconBg: 'linear-gradient(135deg, #2d5016, #78a548)',
  },
  {
    id: 'gallery',
    icon: 'Gallery',
    titleKey: 'galleryTitle',
    descriptionKey: 'galleryDesc',
    buttonKey: 'galleryButton',
    gradient: 'linear-gradient(135deg, #f0f4ff, #e8eeff)',
    iconBg: 'linear-gradient(135deg, #4338ca, #818cf8)',
  },
  {
    id: 'anki',
    icon: 'Anki',
    titleKey: 'ankiTitle',
    descriptionKey: 'ankiDesc',
    buttonKey: 'ankiButton',
    gradient: 'linear-gradient(135deg, #eef8f3, #dff4e7)',
    iconBg: 'linear-gradient(135deg, #0f766e, #34d399)',
  },
  {
    id: 'report',
    icon: 'Stats',
    titleKey: 'reportTitle',
    descriptionKey: 'reportDesc',
    buttonKey: 'reportButton',
    gradient: 'linear-gradient(135deg, #fff3df, #ffe8bd)',
    iconBg: 'linear-gradient(135deg, #b7791f, #f6c453)',
  },
];

interface QuickActionsProps {
  onActionClick?: (actionId: string) => void;
}

export default function QuickActions({ onActionClick }: QuickActionsProps) {
  const { t } = useSettings();

  return (
    <section className="quick-actions-section">
      <div className="section-header">
        <div>
          <span className="eyebrow">{t.quickActions.eyebrow}</span>
          <h2 className="section-title">{t.quickActions.title}</h2>
        </div>
      </div>

      <div className="actions-grid">
        {actions.map((action) => (
          <article
            key={action.id}
            className="action-card"
            style={{ background: action.gradient }}
          >
            <div className="action-icon-wrapper" style={{ background: action.iconBg }}>
              <span className="action-icon">{action.icon}</span>
            </div>

            <div className="action-content">
              <h3 className="action-title">{t.quickActions[action.titleKey]}</h3>
              <p className="action-description">{t.quickActions[action.descriptionKey]}</p>
            </div>

            <button
              className="action-button"
              onClick={() => onActionClick?.(action.id)}
            >
              {t.quickActions[action.buttonKey]} →
            </button>

            {action.id === 'report' && (
              <div className="report-decoration">
                <svg width="80" height="60" viewBox="0 0 80 60" fill="none">
                  <path
                    d="M5 50 L20 35 L35 40 L50 25 L65 30 L75 15"
                    stroke="#B7791F"
                    strokeWidth="2"
                    strokeLinecap="round"
                    opacity="0.35"
                  />
                  <circle cx="75" cy="15" r="3" fill="#B7791F" opacity="0.45" />
                </svg>
              </div>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
