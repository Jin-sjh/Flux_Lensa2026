import { useEffect, useCallback } from 'react';
import type { GalleryCard } from '../../types/gallery';
import type { OutputTask } from '../../services/api';
import { useSettings } from '../../contexts/SettingsContext';

interface GalleryDetailProps {
  card: GalleryCard;
  onClose: () => void;
  onDelete: (id: string) => void;
  onToggleComplete: (id: string) => void;
  onPractice: (task: OutputTask) => void;
}

export default function GalleryDetail({ card, onClose, onDelete, onToggleComplete, onPractice }: GalleryDetailProps) {
  const { t } = useSettings();

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [handleKeyDown]);

  const handleDelete = () => {
    onDelete(card.id);
    onClose();
  };

  return (
    <div className="gallery-detail-overlay" onClick={onClose}>
      <div className="gallery-detail" onClick={(e) => e.stopPropagation()}>
        <button className="gallery-detail-close" onClick={onClose} aria-label="Close">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <div className="gallery-detail-content">
          <div className="gallery-detail-image">
            <img src={card.imageUrl} alt={card.caption} />
          </div>

          <div className="gallery-detail-info">
            <h3 className="gallery-detail-caption">{card.caption}</h3>

            <div className="gallery-detail-section">
              <h4 className="gallery-detail-section-title">{t.gallery.annotations}</h4>
              <div className="gallery-detail-annotations">
                {card.annotations.map((ann, idx) => (
                  <div key={idx} className="gallery-detail-annotation-item">
                    <span className="annotation-object">{ann.object}</span>
                    <span className="annotation-arrow">→</span>
                    <span className="annotation-label">{ann.label}</span>
                    {ann.new_words.length > 0 && (
                      <div className="annotation-words">
                        {ann.new_words.map((w, wi) => (
                          <span key={wi} className="annotation-word-tag">{w.word}</span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {card.task && (
              <div className="gallery-detail-section">
                <h4 className="gallery-detail-section-title">{t.gallery.task}</h4>
                <p className="gallery-detail-task">{card.task.prompt}</p>
              </div>
            )}

            <div className="gallery-detail-actions">
              <a
                href={card.imageUrl}
                download={`lensa_${card.annotations[0]?.object || 'card'}.png`}
                className="gallery-detail-btn primary"
                target="_blank"
                rel="noopener noreferrer"
              >
                💾 {t.gallery.saveImage}
              </a>
              {card.task && (
                <button
                  className="gallery-detail-btn secondary"
                  onClick={() => onPractice(card.task)}
                >
                  ✏️ {t.gallery.startPractice}
                </button>
              )}
              <button
                className="gallery-detail-btn toggle"
                onClick={() => onToggleComplete(card.id)}
              >
                {card.isCompleted ? '↩️' : '✅'} {card.isCompleted ? t.gallery.inProgress : t.gallery.completed}
              </button>
              <button className="gallery-detail-btn danger" onClick={handleDelete}>
                🗑️ {t.gallery.deleteCard}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
