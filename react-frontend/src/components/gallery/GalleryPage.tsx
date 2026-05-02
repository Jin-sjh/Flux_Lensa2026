import { useState, useMemo } from 'react';
import type { GalleryCard as GalleryCardType } from '../../types/gallery';
import type { OutputTask } from '../../services/api';
import { useSettings } from '../../stores/settingsStore';
import GalleryCardItem from './GalleryCard';
import GalleryDetail from './GalleryDetail';

type FilterType = 'all' | 'completed' | 'inProgress';
type SortType = 'newest' | 'oldest';

interface GalleryPageProps {
  cards: GalleryCardType[];
  onDelete: (id: string) => void;
  onToggleComplete: (id: string) => void;
  onUpdateCaption: (id: string, caption: string) => void;
  onNavigate: (page: string) => void;
}

export default function GalleryPage({ cards, onDelete, onToggleComplete, onUpdateCaption, onNavigate }: GalleryPageProps) {
  const { t } = useSettings();
  const [filter, setFilter] = useState<FilterType>('all');
  const [sort, setSort] = useState<SortType>('newest');
  const [selectedCard, setSelectedCard] = useState<GalleryCardType | null>(null);

  const filteredCards = useMemo(() => {
    let result = [...cards];

    if (filter === 'completed') {
      result = result.filter(c => c.isCompleted);
    } else if (filter === 'inProgress') {
      result = result.filter(c => !c.isCompleted);
    }

    result.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sort === 'newest' ? dateB - dateA : dateA - dateB;
    });

    return result;
  }, [cards, filter, sort]);

  const handlePractice = (_task: OutputTask | null) => {
    setSelectedCard(null);
    onNavigate('practice');
  };

  return (
    <div className="page-panel">
      <div className="section-header">
        <div>
          <span className="eyebrow">{t.gallery.eyebrow}</span>
          <h2 className="section-title">{t.gallery.title}</h2>
        </div>
        <div className="section-header-actions">
          <span className="gallery-count">{cards.length} {t.gallery.words}</span>
          <button className="gallery-add-btn" onClick={() => onNavigate('learning')}>
            📷 {t.gallery.addNewCard}
          </button>
        </div>
      </div>

      <div className="gallery-toolbar">
        <div className="gallery-filters">
          <button
            className={`gallery-filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            {t.gallery.all}
          </button>
          <button
            className={`gallery-filter-btn ${filter === 'completed' ? 'active' : ''}`}
            onClick={() => setFilter('completed')}
          >
            {t.gallery.completed}
          </button>
          <button
            className={`gallery-filter-btn ${filter === 'inProgress' ? 'active' : ''}`}
            onClick={() => setFilter('inProgress')}
          >
            {t.gallery.inProgress}
          </button>
        </div>
        <div className="gallery-sort">
          <select
            className="gallery-sort-select"
            value={sort}
            onChange={(e) => setSort(e.target.value as SortType)}
          >
            <option value="newest">{t.gallery.newest}</option>
            <option value="oldest">{t.gallery.oldest}</option>
          </select>
        </div>
      </div>

      {filteredCards.length === 0 ? (
        <div className="gallery-empty">
          <div className="gallery-empty-icon">🎴</div>
          <h3 className="gallery-empty-title">{t.gallery.emptyTitle}</h3>
          <p className="gallery-empty-hint">{t.gallery.emptyHint}</p>
          <button className="gallery-empty-btn" onClick={() => onNavigate('learning')}>
            📷 {t.gallery.goCapture}
          </button>
        </div>
      ) : (
        <div className="gallery-grid">
          {filteredCards.map((card, index) => (
            <GalleryCardItem
              key={card.id}
              card={card}
              onClick={setSelectedCard}
              index={index}
            />
          ))}
        </div>
      )}

      {selectedCard && (
        <GalleryDetail
          card={selectedCard}
          onClose={() => setSelectedCard(null)}
          onDelete={onDelete}
          onToggleComplete={onToggleComplete}
          onUpdateCaption={onUpdateCaption}
          onPractice={handlePractice}
        />
      )}
    </div>
  );
}
