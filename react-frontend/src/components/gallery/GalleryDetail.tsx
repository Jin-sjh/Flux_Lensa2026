import { useEffect, useCallback, useState } from 'react';
import type { GalleryCard } from '../../types/gallery';
import type { OutputTask } from '../../services/api';
import { useSettings } from '../../stores/settingsStore';

interface GalleryDetailProps {
  card: GalleryCard;
  onClose: () => void;
  onDelete: (id: string) => void;
  onToggleComplete: (id: string) => void;
  onUpdateCaption: (id: string, caption: string) => void;
  onPractice: (task: OutputTask | null) => void;
}

export default function GalleryDetail({ card, onClose, onDelete, onToggleComplete, onUpdateCaption, onPractice }: GalleryDetailProps) {
  const { t } = useSettings();
  const [isEditingCaption, setIsEditingCaption] = useState(false);
  const [editedCaption, setEditedCaption] = useState(card.caption || '');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    onDelete(card.id);
    onClose();
  };

  const handleSaveCaption = () => {
    onUpdateCaption(card.id, editedCaption);
    setIsEditingCaption(false);
  };

  const handleCancelEdit = () => {
    setEditedCaption(card.caption || '');
    setIsEditingCaption(false);
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
            <img src={card.imageUrl} alt={card.caption || '学习卡片'} />
          </div>

          <div className="gallery-detail-info">
            {isEditingCaption ? (
              <div className="gallery-detail-caption-section">
                <textarea
                  className="gallery-detail-caption-input"
                  value={editedCaption}
                  onChange={(e) => setEditedCaption(e.target.value)}
                  placeholder={t.gallery.captionPlaceholder}
                  rows={3}
                />
                <div className="gallery-detail-edit-actions">
                  <button className="gallery-detail-btn primary" onClick={handleSaveCaption}>
                    💾 {t.gallery.saveCaption}
                  </button>
                  <button className="gallery-detail-btn secondary" onClick={handleCancelEdit}>
                    ✖️ {t.gallery.cancelEdit}
                  </button>
                </div>
              </div>
            ) : (
              <div className="gallery-detail-caption-section">
                <p className="gallery-detail-caption-text">{card.caption || t.gallery.captionPlaceholder}</p>
                <button
                  className="gallery-detail-edit-btn"
                  onClick={() => setIsEditingCaption(true)}
                  aria-label={t.gallery.editCaption}
                >
                  ✏️ {t.gallery.editCaption}
                </button>
              </div>
            )}

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
                  onClick={() => card.task && onPractice(card.task)}
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

        {showDeleteConfirm && (
          <div className="gallery-confirm-overlay" onClick={(e) => e.stopPropagation()}>
            <div className="gallery-confirm-dialog">
              <h3 className="gallery-confirm-title">{t.gallery.confirmDelete}</h3>
              <div className="gallery-confirm-actions">
                <button className="gallery-confirm-btn danger" onClick={confirmDelete}>
                  🗑️ {t.gallery.deleteCard}
                </button>
                <button className="gallery-confirm-btn secondary" onClick={() => setShowDeleteConfirm(false)}>
                  ✖️ {t.gallery.cancelEdit}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
