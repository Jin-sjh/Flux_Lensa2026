import type { SessionListItem } from '../../services/api';

interface PracticeHistoryPageProps {
  practiceRecords: SessionListItem[];
  isLoading: boolean;
}

export default function PracticeHistoryPage({ practiceRecords, isLoading }: PracticeHistoryPageProps) {

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  return (
    <div className="practice-history-page">
      <div className="page-header">
        <h1 className="page-title">练习记录</h1>
        <p className="page-subtitle">查看你的学习历程和成果</p>
      </div>

      {isLoading ? (
        <div className="practice-loading">
          <div className="loading-spinner"></div>
          <p>加载中...</p>
        </div>
      ) : practiceRecords.length === 0 ? (
        <div className="practice-empty">
          <div className="practice-empty-icon">📝</div>
          <h3 className="practice-empty-title">还没有练习记录</h3>
          <p className="practice-empty-hint">完成练习后，记录会自动出现在这里</p>
        </div>
      ) : (
        <div className="practice-records-list">
          {practiceRecords.map((record) => (
            <div key={record.session_id} className="practice-record-item">
              <div className="practice-record-image">
                {record.thumbnail_path ? (
                  <img src={record.thumbnail_path} alt={record.caption || '练习卡片'} />
                ) : record.image_path ? (
                  <img src={record.image_path} alt={record.caption || '练习卡片'} />
                ) : record.rendered_image_path ? (
                  <img src={record.rendered_image_path} alt={record.caption || '练习卡片'} />
                ) : (
                  <div className="practice-record-placeholder">
                    <span>📷</span>
                  </div>
                )}
              </div>
              <div className="practice-record-info">
                <h3 className="practice-record-caption">{record.caption || '学习卡片'}</h3>
                {record.output_task && (
                  <p className="practice-record-task">
                    <strong>题目：</strong>{record.output_task.prompt}
                  </p>
                )}
                {record.user_output && (
                  <p className="practice-record-answer">
                    <strong>你的答案：</strong>{record.user_output}
                  </p>
                )}
                {record.feedback && (
                  <p className={`practice-record-feedback ${record.feedback.is_correct ? 'correct' : 'wrong'}`}>
                    {record.feedback.is_correct ? '✅ 正确' : '❌ 错误'}
                    {record.feedback.expected && ` — 正确答案: ${record.feedback.expected}`}
                  </p>
                )}
                <span className="practice-record-time">{formatTime(record.created_at)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
