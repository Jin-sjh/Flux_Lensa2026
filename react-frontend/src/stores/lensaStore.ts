import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  evaluateAnswer,
  generateAnnotations,
  getAnkiDownloadUrl,
  renderImage,
  fetchSessions,
  fetchVocabulary,
  completeSession,
  deleteSession,
  updateSession,
} from '../services/api';
import type { Annotation, OutputTask, VocabularyItem, SessionListItem } from '../services/api';
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
  vocabularyItems: VocabularyItem[];
  practiceRecords: SessionListItem[];
  phase: 'upload' | 'practice' | 'completed';
  isLoadingSessions: boolean;
  isLoadingVocabulary: boolean;
}

interface LensaStore extends LensaState {
  handleGenerate: (file: File) => Promise<void>;
  handleSubmitAnswer: (answer: string) => Promise<void>;
  handleDeleteCard: (id: string) => Promise<void>;
  handleToggleComplete: (id: string) => Promise<void>;
  handleUpdateCaption: (id: string, caption: string) => Promise<void>;
  handleCompleteSession: () => Promise<void>;
  loadSessions: () => Promise<void>;
  loadVocabulary: () => Promise<void>;
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
  vocabularyItems: [],
  practiceRecords: [],
  phase: 'upload',
  isLoadingSessions: false,
  isLoadingVocabulary: false,
};

function sessionToGalleryCard(session: SessionListItem): GalleryCard {
  return {
    id: session.session_id,
    imageUrl: session.rendered_image_path || session.image_path || '',
    annotations: [],
    caption: session.caption || '',
    task: session.output_task || null,
    sessionId: session.session_id,
    createdAt: session.created_at,
    isCompleted: session.completed,
  };
}

type PersistedLensaState = Pick<
  LensaState,
  | 'userId'
  | 'level'
  | 'sessionId'
  | 'annotations'
  | 'task'
  | 'resultImageUrl'
  | 'caption'
  | 'phase'
>;

export const useLensaStore = create(
  persist<LensaStore, [], [], PersistedLensaState>(
    (set, get) => ({
      ...initialLensaState,

      loadSessions: async () => {
        set({ isLoadingSessions: true });
        try {
          const response = await fetchSessions(get().userId);
          const galleryCards = response.sessions.map(sessionToGalleryCard);
          const practiceRecords = response.sessions.filter((s) => s.user_output || s.feedback);
          set({
            galleryCards,
            practiceRecords,
            isLoadingSessions: false,
          });
        } catch (error) {
          console.error('Failed to load sessions:', error);
          set({ isLoadingSessions: false });
        }
      },

      loadVocabulary: async () => {
        set({ isLoadingVocabulary: true });
        try {
          const response = await fetchVocabulary(get().userId);
          set({
            vocabularyItems: response.vocabulary,
            isLoadingVocabulary: false,
          });
        } catch (error) {
          console.error('Failed to load vocabulary:', error);
          set({ isLoadingVocabulary: false });
        }
      },

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

          let finalImageUrl = result.renderedImageUrl;

          if (!finalImageUrl) {
            set({ isRendering: true });
            try {
              const renderResult = await renderImage(result.sessionId);
              finalImageUrl = renderResult.imageUrl;
            } catch (error) {
              const message = error instanceof Error ? error.message : '渲染失败';
              set({ isRendering: false, status: message });
              return;
            }
          }

          set({
            isRendering: false,
            resultImageUrl: finalImageUrl,
            status: '学习卡片生成完成',
          });

          if (finalImageUrl) {
            const galleryCard: GalleryCard = {
              id: result.sessionId,
              imageUrl: finalImageUrl,
              annotations: result.annotations,
              caption: result.caption,
              task: result.task,
              sessionId: result.sessionId,
              createdAt: new Date().toISOString(),
              isCompleted: false,
            };
            set((state) => ({ galleryCards: [galleryCard, ...state.galleryCards] }));
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

      handleCompleteSession: async () => {
        const { sessionId } = get();
        if (!sessionId) return;

        try {
          await completeSession(sessionId);
          set({
            phase: 'completed',
            status: '任务已完成！可以开始下一个学习流程',
            sessionId: '',
            annotations: [],
            task: null,
            resultImageUrl: null,
            caption: '',
            feedback: '',
          });
          get().loadSessions();
          get().loadVocabulary();
        } catch (error) {
          console.error('Failed to complete session:', error);
        }
      },

      handleDeleteCard: async (id) => {
        try {
          await deleteSession(id);
          set((state) => ({
            galleryCards: state.galleryCards.filter((card) => card.id !== id),
          }));
        } catch (error) {
          console.error('Failed to delete session:', error);
        }
      },

      handleToggleComplete: async (id) => {
        try {
          const card = get().galleryCards.find((c) => c.id === id);
          if (!card) return;

          const newCompletedStatus = !card.isCompleted;
          await updateSession(id, { completed: newCompletedStatus });

          set((state) => ({
            galleryCards: state.galleryCards.map((card) =>
              card.id === id ? { ...card, isCompleted: newCompletedStatus } : card,
            ),
          }));
        } catch (error) {
          console.error('Failed to toggle complete status:', error);
        }
      },

      handleUpdateCaption: async (id, caption) => {
        try {
          await updateSession(id, { caption });

          set((state) => ({
            galleryCards: state.galleryCards.map((card) =>
              card.id === id ? { ...card, caption } : card,
            ),
          }));
        } catch (error) {
          console.error('Failed to update caption:', error);
        }
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
    }),
    {
      name: 'lensa-storage',
      version: 1,
      partialize: (state): PersistedLensaState => ({
        userId: state.userId,
        level: state.level,
        sessionId: state.sessionId,
        annotations: state.annotations,
        task: state.task,
        resultImageUrl: state.resultImageUrl,
        caption: state.caption,
        phase: state.phase,
      }),
    }
  )
);

export function useLensaApp() {
  const store = useLensaStore();
  const {
    handleGenerate,
    handleSubmitAnswer,
    handleDeleteCard,
    handleToggleComplete,
    handleUpdateCaption,
    handleCompleteSession,
    loadSessions,
    loadVocabulary,
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
    handleUpdateCaption,
    handleCompleteSession,
    loadSessions,
    loadVocabulary,
    setUserId,
    setLevel,
    reset,
  };
}
