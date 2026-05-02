import type { TestResult } from '../../types/auth';
import '../../styles/test.css';

interface TestResultDisplayProps {
  result: TestResult;
  onComplete: () => void;
}

export default function TestResultDisplay({ result, onComplete }: TestResultDisplayProps) {
  const getLevelDescription = (level: string): string => {
    switch (level) {
      case 'A1':
        return '入门水平，能够理解和使用日常问候、基础词汇和非常简单的句子。';
      case 'A2':
        return '初级水平，能够进行简单日常交流，描述身边的人、物和常见场景。';
      case 'B1':
        return '中级水平，能够理解熟悉话题，描述经历、事件和个人观点。';
      default:
        return '';
    }
  };

  const getLevelColor = (level: string): string => {
    switch (level) {
      case 'A1':
        return 'var(--color-success)';
      case 'A2':
        return 'var(--color-info)';
      case 'B1':
        return 'var(--color-warning)';
      default:
        return 'var(--color-text-muted)';
    }
  };

  const levelColor = getLevelColor(result.cefrLevel);

  return (
    <div className="test-result-container">
      <div className="test-shell result-shell">
        <div className="result-header">
          <span className="test-eyebrow">Result</span>
          <div className="result-icon">✓</div>
          <h1 className="result-title">测试完成</h1>
          <p className="result-subtitle">这是你的印尼语水平评估结果。</p>
        </div>

        <div className="result-level-card" style={{ borderColor: levelColor }}>
          <div className="result-level-badge" style={{ background: levelColor }}>
            {result.cefrLevel}
          </div>
          <h2 className="level-title">CEFR {result.cefrLevel} 水平</h2>
          <p className="level-description">{getLevelDescription(result.cefrLevel)}</p>
        </div>

        <div className="result-scores">
          <div className="score-card">
            <div className="score-circle">
              <svg viewBox="0 0 100 100" aria-hidden="true">
                <circle className="score-bg" cx="50" cy="50" r="45" />
                <circle
                  className="score-fill"
                  cx="50"
                  cy="50"
                  r="45"
                  strokeDasharray={`${result.score * 2.83} ${283 - result.score * 2.83}`}
                  style={{ stroke: levelColor }}
                />
              </svg>
              <div className="score-value">{result.score}</div>
            </div>
            <p className="score-label">总分</p>
          </div>

          <div className="score-card">
            <div className="score-circle">
              <svg viewBox="0 0 100 100" aria-hidden="true">
                <circle className="score-bg" cx="50" cy="50" r="45" />
                <circle
                  className="score-fill"
                  cx="50"
                  cy="50"
                  r="45"
                  strokeDasharray={`${result.vocabularyScore * 2.83} ${283 - result.vocabularyScore * 2.83}`}
                  style={{ stroke: 'var(--color-success)' }}
                />
              </svg>
              <div className="score-value">{result.vocabularyScore}</div>
            </div>
            <p className="score-label">词汇</p>
          </div>

          <div className="score-card">
            <div className="score-circle">
              <svg viewBox="0 0 100 100" aria-hidden="true">
                <circle className="score-bg" cx="50" cy="50" r="45" />
                <circle
                  className="score-fill"
                  cx="50"
                  cy="50"
                  r="45"
                  strokeDasharray={`${result.grammarScore * 2.83} ${283 - result.grammarScore * 2.83}`}
                  style={{ stroke: 'var(--color-info)' }}
                />
              </svg>
              <div className="score-value">{result.grammarScore}</div>
            </div>
            <p className="score-label">语法</p>
          </div>
        </div>

        <div className="result-details">
          <div className="detail-item">
            <span className="detail-label">题目总数</span>
            <span className="detail-value">{result.totalQuestions}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">答对题数</span>
            <span className="detail-value">{result.correctAnswers}</span>
          </div>
        </div>

        {result.recommendations.length > 0 && (
          <div className="recommendations">
            <h3 className="recommendations-title">学习建议</h3>
            <ul className="recommendations-list">
              {result.recommendations.map((rec, index) => (
                <li key={index} className="recommendation-item">
                  <span className="recommendation-icon">i</span>
                  <span className="recommendation-text">{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <button className="complete-btn" onClick={onComplete}>
          开始学习
        </button>
      </div>
    </div>
  );
}
