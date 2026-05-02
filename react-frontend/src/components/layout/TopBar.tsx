import { useSettings } from '../../contexts/SettingsContext';
import type { AppLanguage } from '../../contexts/SettingsContext';
import { useResponsive } from '../../hooks/useResponsive';

export default function TopBar({ isSidebarCollapsed = false }: { isSidebarCollapsed?: boolean }) {
  const { isMobile } = useResponsive();
  const { language, setLanguage, languages, formatTime, t } = useSettings();

  if (isMobile) return null;

  return (
    <div className={`top-bar ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <div className="time-display" aria-label={t.common.currentTime}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
        <span>{formatTime()}</span>
      </div>

      <select
        className="language-selector"
        value={language}
        onChange={(event) => setLanguage(event.target.value as AppLanguage)}
        aria-label={t.common.language}
      >
        {Object.entries(languages).map(([value, meta]) => (
          <option key={value} value={value}>
            {meta.label}
          </option>
        ))}
      </select>

      <div className="user-avatar">N</div>
    </div>
  );
}
