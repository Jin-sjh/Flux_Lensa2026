import { useState } from 'react';
import type { OutputTask } from '../services/api';

interface PracticeProps {
  task: OutputTask | null;   // ← 改成对象
  feedback: string;
  onSubmit: (answer: string) => void;
  disabled: boolean;
}

export default function Practice({ task, feedback, onSubmit, disabled }: PracticeProps) {
  const [answer, setAnswer] = useState('');

  const handleSubmit = () => {
    if (answer.trim()) {
      onSubmit(answer.trim());
      setAnswer('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSubmit();
  };

  const isCorrect = feedback.startsWith('✅');
  const isWrong = feedback.startsWith('🔄');

  return (
    <div className="practice-section">
      <div className="practice-task">
        {task ? (
          <p className="practice-task-text">{task.prompt}</p>   // ← task.prompt 显示题目
        ) : (
          <p className="practice-task-placeholder">生成学习内容后将出现练习题...</p>
        )}
      </div>
      <div className="practice-input-row">
        <input
          type="text"
          className="practice-answer-input"
          placeholder="在这里输入印尼语..."
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
        />
        <button
          className="lensa-btn lensa-btn-secondary"
          onClick={handleSubmit}
          disabled={!answer.trim() || disabled}
        >
          提交
        </button>
      </div>
      {feedback && (
        <div className={`practice-feedback ${isCorrect ? 'correct' : ''} ${isWrong ? 'wrong' : ''}`}>
          {feedback}
        </div>
      )}
    </div>
  );
}