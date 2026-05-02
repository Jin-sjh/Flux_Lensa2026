import { useCallback, useEffect, useRef, useState } from 'react';
import { useSettings } from '../../stores/settingsStore';

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
  variant = 'default',
}: ImageUploaderProps) {
  const { t } = useSettings();
  const fileRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const isCompact = variant === 'compact';

  const emitSelection = useCallback(
    (file: File) => {
      setSelectedFile(file);
      setPreview((currentPreview) => {
        if (currentPreview) URL.revokeObjectURL(currentPreview);
        return URL.createObjectURL(file);
      });

      if (!showGenerateButton) {
        onImageSelect?.(file);
      }
    },
    [onImageSelect, showGenerateButton],
  );

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const stopCamera = useCallback(() => {
    if (!cameraStream) return;
    cameraStream.getTracks().forEach((track) => track.stop());
    setCameraStream(null);
  }, [cameraStream]);

  useEffect(() => {
    if (showCameraModal && cameraStream && videoRef.current) {
      videoRef.current.srcObject = cameraStream;
    }
  }, [showCameraModal, cameraStream]);

  useEffect(() => () => stopCamera(), [stopCamera]);

  const openFilePicker = () => {
    if (!disabled) fileRef.current?.click();
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) emitSelection(file);
  };

  const handleGenerate = () => {
    if (!selectedFile) return;
    onGenerate?.(selectedFile);
    if (!showGenerateButton) {
      onImageSelect?.(selectedFile);
    }
  };

  const handleClear = () => {
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    setSelectedFile(null);
    if (fileRef.current) fileRef.current.value = '';
  };

  const openCamera = useCallback(async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });
      setCameraStream(stream);
      setShowCameraModal(true);
    } catch (error) {
      console.error('Camera error:', error);
      setCameraError('无法访问摄像头，请检查浏览器权限设置。');
    }
  }, []);

  const closeCameraModal = useCallback(() => {
    stopCamera();
    setShowCameraModal(false);
    setCameraError(null);
  }, [stopCamera]);

  const capturePhoto = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const file = new File([blob], `capture_${Date.now()}.jpg`, {
          type: 'image/jpeg',
        });
        emitSelection(file);
        closeCameraModal();
      },
      'image/jpeg',
      0.9,
    );
  }, [closeCameraModal, emitSelection]);

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      emitSelection(file);
    }
  };

  return (
    <div className={isCompact ? 'image-uploader-compact' : 'image-uploader'}>
      <div className="uploader-container">
        {(showEyebrow || !isCompact) && (
          <div className="uploader-header">
            {showEyebrow && <span className="eyebrow">{t.upload.eyebrow}</span>}
            <h2>{t.upload.title}</h2>
            <p className="uploader-subtitle">{t.upload.subtitle}</p>
          </div>
        )}

        <div
          className={`uploader-dropzone ${isDragging ? 'dragging' : ''} ${preview ? 'has-preview' : ''}`}
          onClick={() => {
            if (!preview) openFilePicker();
          }}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          role="button"
          tabIndex={0}
        >
          {preview ? (
            <img
              src={preview}
              alt={t.upload.previewAlt}
              className="uploader-preview-img"
            />
          ) : (
            <div className="uploader-placeholder">
              <div className="uploader-icon-circle">
                <svg
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
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
          <button
            type="button"
            className="uploader-btn primary"
            onClick={openCamera}
            disabled={disabled}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
            {t.upload.openCamera}
          </button>

          {preview && (
            <button
              type="button"
              className="uploader-btn clear"
              onClick={handleClear}
              disabled={disabled}
            >
              {t.upload.clear}
            </button>
          )}

          {showGenerateButton && (
            <button
              type="button"
              className="uploader-btn generate"
              onClick={handleGenerate}
              disabled={disabled || !selectedFile}
            >
              {disabled ? t.upload.generating : t.upload.generate}
            </button>
          )}
        </div>
      </div>

      {showCameraModal && (
        <div className="camera-modal-overlay" onClick={closeCameraModal}>
          <div className="camera-modal" onClick={(event) => event.stopPropagation()}>
            <div className="camera-modal-header">
              <h3>拍照</h3>
              <button
                type="button"
                className="camera-close-btn"
                onClick={closeCameraModal}
              >
                x
              </button>
            </div>

            <div className="camera-preview-container">
              {cameraError ? (
                <div className="camera-error">
                  <p>{cameraError}</p>
                </div>
              ) : (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="camera-video"
                />
              )}
            </div>

            <div className="camera-modal-actions">
              <button
                type="button"
                className="camera-btn cancel"
                onClick={closeCameraModal}
              >
                取消
              </button>
              <button
                type="button"
                className="camera-btn capture"
                onClick={capturePhoto}
                disabled={Boolean(cameraError)}
              >
                拍照
              </button>
            </div>
          </div>
          <canvas ref={canvasRef} style={{ display: 'none' }} />
        </div>
      )}
    </div>
  );
}
