import { useSettings } from '../../stores/settingsStore';

interface LearningItem {
  id: string;
  word: string;
  translationKey: 'coffee' | 'bag' | 'bicycle';
  image?: string;
  learnedAtKey: 'learnedOneHour' | 'learnedThreeHours' | 'learnedYesterday';
  isCompleted: boolean;
}

const mockData: LearningItem[] = [
  {
    id: '1',
    word: 'kopi',
    translationKey: 'coffee',
    learnedAtKey: 'learnedOneHour',
    isCompleted: true,
  },
  {
    id: '2',
    word: 'tas',
    translationKey: 'bag',
    learnedAtKey: 'learnedThreeHours',
    isCompleted: true,
  },
  {
    id: '3',
    word: 'sepeda',
    translationKey: 'bicycle',
    learnedAtKey: 'learnedYesterday',
    isCompleted: true,
  },
];

interface RecentLearningProps {
  items?: LearningItem[];
}

export default function RecentLearning({ items = mockData }: RecentLearningProps) {
  const { t } = useSettings();

  return (
    <section className="recent-learning-section">
      <div className="section-header">
        <div>
          <span className="eyebrow">{t.recent.eyebrow}</span>
          <h2 className="section-title">{t.recent.title}</h2>
        </div>
        <button className="view-all-btn">{t.common.viewAll} &gt;</button>
      </div>

      <div className="recent-learning-grid">
        {items.map((item) => (
          <article key={item.id} className="learning-card">
            <div className="learning-image">
              {item.image ? (
                <img src={item.image} alt={item.word} />
              ) : (
                <div className="learning-placeholder">
                  <span>{item.word.slice(0, 1).toUpperCase()}</span>
                </div>
              )}
            </div>

            <div className="learning-info">
              <h3 className="learning-word">{item.word}</h3>
              <p className="learning-translation">{t.recent[item.translationKey]}</p>
              <span className="learning-time">{t.recent[item.learnedAtKey]}</span>
            </div>

            {item.isCompleted && (
              <div className="completion-badge" aria-label={t.recent.completed}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
