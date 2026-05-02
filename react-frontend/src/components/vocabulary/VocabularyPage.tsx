import { useState, useMemo } from 'react';
import type { VocabularyItem } from '../../services/api';

type FilterType = 'all' | 'learning' | 'learned' | 'mastered';

interface VocabularyPageProps {
  vocabularyItems: VocabularyItem[];
  isLoading: boolean;
}

export default function VocabularyPage({ vocabularyItems, isLoading }: VocabularyPageProps) {
  const [filter, setFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredItems = useMemo(() => {
    let result = [...vocabularyItems];

    if (filter !== 'all') {
      result = result.filter((item) => item.status === filter);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (item) =>
          item.word.toLowerCase().includes(query) ||
          item.translation_zh?.toLowerCase().includes(query) ||
          item.translation_en?.toLowerCase().includes(query)
      );
    }

    return result;
  }, [vocabularyItems, filter, searchQuery]);

  const statusLabels: Record<string, string> = {
    learning: '学习中',
    learned: '已掌握',
    mastered: '精通',
  };

  const statusColors: Record<string, string> = {
    learning: '#f59e0b',
    learned: '#10b981',
    mastered: '#6366f1',
  };

  return (
    <div className="page-panel">
      <div className="section-header">
        <div>
          <span className="eyebrow">Vocabulary</span>
          <h2 className="section-title">词汇本</h2>
        </div>
        <span className="vocabulary-count">{vocabularyItems.length} 个词汇</span>
      </div>

      <div className="vocabulary-toolbar">
        <div className="vocabulary-filters">
          <button
            className={`vocabulary-filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            全部
          </button>
          <button
            className={`vocabulary-filter-btn ${filter === 'learning' ? 'active' : ''}`}
            onClick={() => setFilter('learning')}
          >
            学习中
          </button>
          <button
            className={`vocabulary-filter-btn ${filter === 'learned' ? 'active' : ''}`}
            onClick={() => setFilter('learned')}
          >
            已掌握
          </button>
          <button
            className={`vocabulary-filter-btn ${filter === 'mastered' ? 'active' : ''}`}
            onClick={() => setFilter('mastered')}
          >
            精通
          </button>
        </div>
        <div className="vocabulary-search">
          <input
            type="text"
            className="vocabulary-search-input"
            placeholder="搜索单词..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="vocabulary-loading">
          <div className="loading-spinner"></div>
          <p>加载中...</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="vocabulary-empty">
          <div className="vocabulary-empty-icon">📚</div>
          <h3 className="vocabulary-empty-title">还没有学习词汇</h3>
          <p className="vocabulary-empty-hint">拍照学习后，新词汇会自动添加到这里</p>
        </div>
      ) : (
        <div className="vocabulary-list">
          {filteredItems.map((item) => (
            <div key={item.word} className="vocabulary-item">
              <div className="vocabulary-item-main">
                <span className="vocabulary-word">{item.word}</span>
                <span
                  className="vocabulary-status"
                  style={{ backgroundColor: statusColors[item.status] || '#6b7280' }}
                >
                  {statusLabels[item.status] || item.status}
                </span>
              </div>
              <div className="vocabulary-item-translations">
                {item.translation_zh && (
                  <span className="vocabulary-translation-zh">{item.translation_zh}</span>
                )}
                {item.translation_en && (
                  <span className="vocabulary-translation-en">{item.translation_en}</span>
                )}
              </div>
              <div className="vocabulary-item-meta">
                {item.last_seen_at && (
                  <span className="vocabulary-meta-item">
                    上次复习: {new Date(item.last_seen_at).toLocaleDateString()}
                  </span>
                )}
                <span className="vocabulary-meta-item">间隔: {item.interval} 天</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
