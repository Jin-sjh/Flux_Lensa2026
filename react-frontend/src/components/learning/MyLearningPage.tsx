import ImageUploader from '../common/ImageUploader';
import WelcomeSection from '../dashboard/WelcomeSection';
import ResultCard from '../ResultCard';
import Practice from '../Practice';
import type { OutputTask } from '../../services/api';

interface Annotation {
  object: string;
  label: string;
  new_words: Array<{
    word: string;
    translation_zh: string;
    translation_en: string;
    id?: string;
  }>;
}

interface MyLearningPageProps {
  onImageSelect?: (file: File) => void;
  resultImageUrl?: string | null;
  isRendering?: boolean;
  annotations?: Annotation[];
  task?: OutputTask | null;
  feedback?: string;
  onSubmitAnswer?: (answer: string) => void;
  disabled?: boolean;
}

export default function MyLearningPage({
  onImageSelect,
  resultImageUrl,
  isRendering,
  annotations,
  task,
  feedback,
  onSubmitAnswer,
  disabled,
}: MyLearningPageProps) {

  return (
    <div className="learning-page">
      <WelcomeSection variant="lite" />

      <ImageUploader
        onImageSelect={onImageSelect}
        onGenerate={onImageSelect}
        showGenerateButton={true}
        disabled={disabled}
        variant="default"
      />

      <ResultCard
        imageUrl={resultImageUrl ?? null}
        isRendering={isRendering ?? false}
      />

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
        disabled={disabled ?? false}
      />
    </div>
  );
}
