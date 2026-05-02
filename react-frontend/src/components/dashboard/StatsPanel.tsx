import { useSettings } from '../../stores/settingsStore';

interface StatsPanelProps {
  stats?: {
    todayMinutes: number;
    totalWords: number;
    streakDays: number;
    accuracyRate: number;
  };
}

const defaultStats = {
  todayMinutes: 24,
  totalWords: 128,
  streakDays: 5,
  accuracyRate: 87,
};

export default function StatsPanel({ stats = defaultStats }: StatsPanelProps) {
  const { t } = useSettings();

  const statItems = [
    {
      id: 'today',
      icon: 'Focus',
      label: t.stats.today,
      value: `${stats.todayMinutes} ${t.stats.minutes}`,
      color: '#2d5016',
      bgColor: '#eef6e8',
    },
    {
      id: 'words',
      icon: 'Words',
      label: t.stats.words,
      value: `${stats.totalWords} ${t.stats.count}`,
      color: '#0f766e',
      bgColor: '#e7f7f2',
    },
    {
      id: 'streak',
      icon: 'Streak',
      label: t.stats.streak,
      value: `${stats.streakDays} ${t.stats.days}`,
      color: '#b7791f',
      bgColor: '#fff3df',
    },
    {
      id: 'accuracy',
      icon: 'Score',
      label: t.stats.accuracy,
      value: `${stats.accuracyRate}%`,
      color: '#7c3aed',
      bgColor: '#f2ecff',
    },
  ];

  return (
    <aside className="stats-panel-wrapper">
      <div className="stats-panel-header">
        <div>
          <span className="eyebrow">{t.stats.eyebrow}</span>
          <h2 className="stats-title">{t.stats.title}</h2>
        </div>
        <button className="stats-view-all">{t.common.all} &gt;</button>
      </div>

      <div className="stats-list">
        {statItems.map((item) => (
          <article key={item.id} className="stat-card">
            <div
              className="stat-icon-wrapper"
              style={{ backgroundColor: item.bgColor, color: item.color }}
            >
              <span className="stat-icon">{item.icon}</span>
            </div>
            <div className="stat-content">
              <div className="stat-value">{item.value}</div>
              <div className="stat-label">{item.label}</div>
            </div>
            <div
              className="stat-accent-bar"
              style={{ backgroundColor: item.color }}
            />
          </article>
        ))}
      </div>

      <div className="daily-note">
        <span>{t.stats.noteTitle}</span>
        <p>{t.stats.note}</p>
      </div>
    </aside>
  );
}
