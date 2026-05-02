import type { Annotation, OutputTask } from '../services/api';

export interface GalleryCard {
  id: string;
  imageUrl: string;
  originalImageUrl?: string;
  annotations: Annotation[];
  caption: string;
  task: OutputTask | null;
  sessionId: string;
  createdAt: string;
  isCompleted: boolean;
}
