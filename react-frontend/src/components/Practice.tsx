import { useState } from 'react';
import type { OutputTask } from '../services/api';

interface PracticeProps {
  task: OutputTask | null;
  feedback: string;
  onSubmit: (answer: string) => void;
  disabled: boolean;
}

export default function Practice({ task, feedback, onSubmit, disabled }: PracticeProps) {
  const [answer, setAnswer] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = () => {
    if (answer.trim()) {
      onSubmit(answer.trim());
      setAnswer('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !disabled) handleSubmit();
  };

  const isCorrect = feedback.startsWith('✅') || feedback.startsWith('非常') || feedback.startsWith('太棒') || feedback.startsWith('正确') || feedback.startsWith('很好');
  const isWrong = feedback.startsWith('🔄') || feedback.startsWith('提示');

  return (
    <div className="practice-container">
      <div className="practice-card">
        <div className="practice-header">
          <div className="practice-icon-wrapper">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <div>
            <h3 className="practice-title">学习练习</h3>
            <p className="practice-subtitle">巩固你的印尼语知识</p>
          </div>
        </div>

        <div className={`practice-task-area ${task ? 'has-task' : ''}`}>
          {task ? (
            <div className="task-content">
              <div className="task-label">题目</div>
              <p className="practice-task-text">{task.prompt}</p>
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-illustration">
                <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              </div>
              <p className="empty-title">准备开始练习</p>
              <p className="empty-hint">生成学习内容后将出现练习题...</p>
            </div>
          )}
        </div>

        <div className={`practice-input-section ${isFocused ? 'focused' : ''}`}>
          <div className="input-wrapper">
            <div className="input-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </div>
            <input
              type="text"
              className="practice-answer-input"
              placeholder="在这里输入印尼语..."
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              disabled={disabled}
            />
            <button
              className={`submit-btn ${answer.trim() && !disabled ? 'active' : ''}`}
              onClick={handleSubmit}
              disabled={!answer.trim() || disabled}
            >
              <span className="btn-text">提交</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </button>
          </div>
        </div>

        {feedback && (
          <div className={`practice-feedback ${isCorrect ? 'correct' : ''} ${isWrong ? 'wrong' : ''}`}>
            <div className="feedback-icon">
              {isCorrect && (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
              {isWrong && (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              )}
            </div>
            <span className="feedback-text">{feedback}</span>
          </div>
        )}
      </div>
    </div>
  );
}
