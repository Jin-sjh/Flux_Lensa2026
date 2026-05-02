import { forwardRef } from 'react';
import ImageUploader from '../common/ImageUploader';
import WelcomeSection from '../dashboard/WelcomeSection';
import ResultCard from '../ResultCard';
import Practice from '../Practice';
import type { OutputTask, Annotation } from '../../services/api';

interface MyLearningPageProps {
  onImageSelect?: (file: File) => void;
  resultImageUrl?: string | null;
  isRendering?: boolean;
  annotations?: Annotation[];
  task?: OutputTask | null;
  feedback?: string;
  onSubmitAnswer?: (answer: string) => void;
  onCompleteSession?: () => void;
  disabled?: boolean;
  phase?: 'upload' | 'practice' | 'completed';
  status?: string;
  caption?: string;
}

const MyLearningPage = forwardRef<HTMLDivElement, MyLearningPageProps>(({
  onImageSelect,
  resultImageUrl,
  isRendering,
  annotations,
  task,
  feedback,
  onSubmitAnswer,
  onCompleteSession,
  disabled,
  phase = 'upload',
  status,
  caption,
}, ref) => {
  return (
    <div className="learning-page">
      <WelcomeSection variant="lite" />

      <div ref={ref}>
        <ImageUploader
          onImageSelect={onImageSelect}
          onGenerate={onImageSelect}
          showGenerateButton={true}
          disabled={disabled}
          variant="default"
        />
      </div>

      {status && phase !== 'upload' && (
        <p className="status-text">{status}</p>
      )}

      <ResultCard
        imageUrl={resultImageUrl ?? null}
        isRendering={isRendering ?? false}
      />

      {caption && phase === 'practice' && (
        <div className="caption-section">
          <p className="caption-text">{caption}</p>
        </div>
      )}

      {annotations && annotations.length > 0 && (
        <div className="annotations-section">
          <h3>📝 识别结果</h3>
          <ul>
            {annotations.map((ann, idx) => (
              <li key={idx}>
                <strong>{ann.object}</strong> ({ann.label})
                <ul>
                  {ann.new_words.map((w, i) => (
                    <li key={i}>
                      {w.word} — {w.translation_zh} / {w.translation_en}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </div>
      )}

      <Practice
        task={task ?? null}
        feedback={feedback ?? ''}
        onSubmit={onSubmitAnswer ?? (() => {})}
        onComplete={onCompleteSession ?? (() => {})}
        disabled={disabled ?? false}
      />
    </div>
  );
});

export default MyLearningPage;
