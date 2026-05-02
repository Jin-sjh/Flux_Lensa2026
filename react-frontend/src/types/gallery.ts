import type { Annotation } from '../services/api';

export interface GalleryCard {
  id: string;
  imageUrl: string;
  originalImageUrl?: string;
  annotations: Annotation[];
  caption: string;
  task: string;
  sessionId: string;
  createdAt: string;
  isCompleted: boolean;
}
