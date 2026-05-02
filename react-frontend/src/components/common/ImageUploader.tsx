import { useCallback, useEffect, useRef, useState } from 'react';
import { useSettings } from '../../contexts/SettingsContext';

interface ImageUploaderProps {
  onImageSelect?: (file: File) => void;
  onGenerate?: (file: File) => void;
  disabled?: boolean;
  showGenerateButton?: boolean;
  showEyebrow?: boolean;
  variant?: 'default' | 'compact';
}

export default function ImageUploader({
  onImageSelect,
  onGenerate,
  disabled = false,
  showGenerateButton = false,
  showEyebrow = false,
  variant = 'default'
}: ImageUploaderProps) {
  const { t } = useSettings();
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = useCallback((file: File | undefined) => {
    if (!file) return;
    setSelectedFile(file);
    setPreview((currentPreview) => {
      if (currentPreview) URL.revokeObjectURL(currentPreview);
      return URL.createObjectURL(file);
    });
    if (!showGenerateButton) {
      onImageSelect?.(file);
    }
  }, [onImageSelect, showGenerateButton]);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    handleFileChange(event.target.files?.[0]);
  };

  const handleGenerate = () => {
    if (selectedFile) {
      onGenerate?.(selectedFile);
      onImageSelect?.(selectedFile);
    }
  };

  const handleClear = () => {
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    setSelectedFile(null);
    if (fileRef.current) fileRef.current.value = '';
    if (cameraRef.current) cameraRef.current.value = '';
  };

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    if (!disabled) setIsDragging(true);
  }, [disabled]);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (file?.type.startsWith('image/')) {
      handleFileChange(file);
    }
  }, [handleFileChange]);

  const containerClass = variant === 'compact' ? 'image-uploader-compact' : 'image-uploader';

  return (
    <div className={containerClass}>
      <div className="uploader-container">
        {(showEyebrow || variant === 'default') && (
          <div className="uploader-header">
            {showEyebrow && <span className="eyebrow">{t.upload.eyebrow}</span>}
            <h2>{t.upload.title}</h2>
            <p className="uploader-subtitle">{t.upload.subtitle}</p>
          </div>
        )}

        <div
          className={`uploader-dropzone ${isDragging ? 'dragging' : ''} ${preview ? 'has-preview' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !preview && fileRef.current?.click()}
        >
          {preview ? (
            <img src={preview} alt={t.upload.previewAlt} className="uploader-preview-img" />
          ) : (
            <div className="uploader-placeholder">
              <div className="uploader-icon-circle">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
              </div>
              <p className="placeholder-title">{t.upload.placeholderTitle}</p>
              <p className="placeholder-hint">{t.upload.placeholderHint}</p>
            </div>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={handleInputChange}
            disabled={disabled}
            className="uploader-file-input"
          />
        </div>

        <div className="uploader-actions">
          <label className={`uploader-btn primary ${disabled ? 'disabled' : ''}`}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
            {t.upload.openCamera}
            <input
              ref={cameraRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleInputChange}
              disabled={disabled}
              className="uploader-file-input"
            />
          </label>

          {preview && (
            <button className="uploader-btn clear" onClick={handleClear} disabled={disabled}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
              {t.upload.clear}
            </button>
          )}

          {showGenerateButton && (
            <button
              className="uploader-btn generate"
              onClick={preview ? handleGenerate : () => fileRef.current?.click()}
              disabled={disabled || (preview ? !selectedFile : false)}
            >
              {disabled ? t.upload.generating : preview ? t.upload.generate : t.upload.chooseFirst}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
