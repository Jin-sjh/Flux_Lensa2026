import ImageUploader from '../common/ImageUploader';

interface CameraUploadProps {
  onCapture?: (file: File) => void;
  disabled?: boolean;
}

export default function CameraUpload({ onCapture, disabled }: CameraUploadProps) {
  return (
    <ImageUploader
      onGenerate={onCapture}
      disabled={disabled}
      showGenerateButton={true}
      showEyebrow={true}
      variant="default"
    />
  );
}
