import type { GalleryCard as GalleryCardType } from '../../types/gallery';
import { useSettings } from '../../stores/settingsStore';

interface GalleryCardProps {
  card: GalleryCardType;
  onClick: (card: GalleryCardType) => void;
  index: number;
}

export default function GalleryCardItem({ card, onClick, index }: GalleryCardProps) {
  const { t } = useSettings();

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const displayCaption = card.caption || card.annotations[0]?.object || '';

  return (
    <article
      className="gallery-card"
      onClick={() => onClick(card)}
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      <div className="gallery-card-image">
        <img src={card.imageUrl} alt={card.caption || '学习卡片'} loading="lazy" />
        {card.isCompleted && (
          <div className="gallery-card-badge">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
        )}
      </div>
      <div className="gallery-card-overlay">
        <span className="gallery-card-word">{displayCaption}</span>
      </div>
      <div className="gallery-card-meta">
        <span className="gallery-card-time">{formatTime(card.createdAt)}</span>
        <span className="gallery-card-count">{card.annotations.length} {t.gallery.words}</span>
      </div>
    </article>
  );
}
