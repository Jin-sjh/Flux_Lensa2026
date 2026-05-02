import { create } from 'zustand';
import { evaluateAnswer, generateAnnotations, getAnkiDownloadUrl, renderImage } from '../services/api';
import type { Annotation, OutputTask } from '../services/api';
import type { GalleryCard } from '../types/gallery';

export interface LensaState {
  userId: string;
  level: string;
  sessionId: string;
  annotations: Annotation[];
  task: OutputTask | null;
  resultImageUrl: string | null;
  caption: string;
  status: string;
  feedback: string;
  isGenerating: boolean;
  isRendering: boolean;
  galleryCards: GalleryCard[];
  phase: 'upload' | 'practice';
}

interface LensaStore extends LensaState {
  handleGenerate: (file: File) => Promise<void>;
  handleSubmitAnswer: (answer: string) => Promise<void>;
  handleDeleteCard: (id: string) => void;
  handleToggleComplete: (id: string) => void;
  setUserId: (userId: string) => void;
  setLevel: (level: string) => void;
  reset: () => void;
}

export const initialLensaState: LensaState = {
  userId: 'demo_user',
  level: 'A1',
  sessionId: '',
  annotations: [],
  task: null,
  resultImageUrl: null,
  caption: '',
  status: '拍照或上传图片，开始学习印尼语',
  feedback: '',
  isGenerating: false,
  isRendering: false,
  galleryCards: [],
  phase: 'upload',
};

export const useLensaStore = create<LensaStore>((set, get) => ({
  ...initialLensaState,

  handleGenerate: async (file) => {
    set({
      isGenerating: true,
      isRendering: false,
      status: '识别中，请稍候...',
      feedback: '',
      resultImageUrl: null,
    });

    try {
      const result = await generateAnnotations(file, get().userId);
      set({
        isGenerating: false,
        sessionId: result.sessionId,
        annotations: result.annotations,
        task: result.task,
        caption: result.caption,
        status: '标注完成，正在生成学习卡片...',
        phase: 'practice',
      });

      set({ isRendering: true });

      try {
        const renderResult = await renderImage(result.sessionId);
        set({
          isRendering: false,
          resultImageUrl: renderResult.imageUrl,
          status: '学习卡片生成完成',
        });

        const galleryCard: GalleryCard = {
          id: `card-${Date.now()}-${Math.random().toString(36).substring(7)}`,
          imageUrl: renderResult.imageUrl,
          annotations: result.annotations,
          caption: result.caption,
          task: result.task,
          sessionId: result.sessionId,
          createdAt: new Date().toISOString(),
          isCompleted: false,
        };
        set((state) => ({ galleryCards: [galleryCard, ...state.galleryCards] }));
      } catch (error) {
        const message = error instanceof Error ? error.message : '渲染失败';
        set({ isRendering: false, status: message });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : '生成失败';
      set({ isGenerating: false, status: message });
    }
  },

  handleSubmitAnswer: async (answer) => {
    const { sessionId } = get();
    if (!sessionId) {
      set({ feedback: '请先生成内容' });
      return;
    }

    if (!answer.trim()) {
      set({ feedback: '请输入你的回答' });
      return;
    }

    try {
      const result = await evaluateAnswer(sessionId, answer);
      set({ feedback: result.feedback });
    } catch (error) {
      set({
        feedback: `评估失败：${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    }
  },

  handleDeleteCard: (id) => {
    set((state) => ({
      galleryCards: state.galleryCards.filter((card) => card.id !== id),
    }));
  },

  handleToggleComplete: (id) => {
    set((state) => ({
      galleryCards: state.galleryCards.map((card) =>
        card.id === id ? { ...card, isCompleted: !card.isCompleted } : card,
      ),
    }));
  },

  setUserId: (userId) => {
    set({ userId });
  },

  setLevel: (level) => {
    set({ level });
  },

  reset: () => {
    set(initialLensaState);
  },
}));

export function useLensaApp() {
  const store = useLensaStore();
  const {
    handleGenerate,
    handleSubmitAnswer,
    handleDeleteCard,
    handleToggleComplete,
    setUserId,
    setLevel,
    reset,
    ...state
  } = store;

  return {
    state,
    ankiUrl: getAnkiDownloadUrl(state.userId),
    handleGenerate,
    handleSubmitAnswer,
    handleDeleteCard,
    handleToggleComplete,
    setUserId,
    setLevel,
    reset,
  };
}
