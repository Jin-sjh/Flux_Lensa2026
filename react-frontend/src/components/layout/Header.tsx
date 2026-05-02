import { useSettings } from '../../stores/settingsStore';

interface HeaderProps {
  onMenuClick?: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const { formatTime, t } = useSettings();

  return (
    <header className="mobile-header">
      <button className="header-menu-btn" onClick={onMenuClick} aria-label={t.common.openMenu}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      <div className="header-logo">
        <span className="header-logo-icon">L</span>
        <span className="header-logo-text">Lensa</span>
      </div>

      <div className="header-actions">
        <span className="header-time" aria-label={t.common.currentTime}>
          {formatTime()}
        </span>
        <button className="header-action-btn" aria-label={t.common.notifications}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
        </button>
        <div className="header-avatar">N</div>
      </div>
    </header>
  );
}
