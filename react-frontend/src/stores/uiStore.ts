import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface UIState {
  activeNav: string;
  imagePreview: string | null;
  practiceAnswer: string;
  hasSubmittedAnswer: boolean;
  imageTimestamp: number | null;
}

interface UIStore extends UIState {
  setActiveNav: (nav: string) => void;
  setImagePreview: (preview: string | null) => void;
  setPracticeAnswer: (answer: string) => void;
  setHasSubmittedAnswer: (submitted: boolean) => void;
  clearImagePreview: () => void;
  clearPracticeAnswer: () => void;
  reset: () => void;
}

const initialState: UIState = {
  activeNav: 'home',
  imagePreview: null,
  practiceAnswer: '',
  hasSubmittedAnswer: false,
  imageTimestamp: null,
};

type PersistedUIState = UIState;

export const useUIStore = create(
  persist<UIStore, [], [], PersistedUIState>(
    (set) => ({
      ...initialState,

      setActiveNav: (nav) => set({ activeNav: nav }),

      setImagePreview: (preview) =>
        set({
          imagePreview: preview,
          imageTimestamp: preview ? Date.now() : null,
        }),

      setPracticeAnswer: (answer) => set({ practiceAnswer: answer }),

      setHasSubmittedAnswer: (submitted) => set({ hasSubmittedAnswer: submitted }),

      clearImagePreview: () =>
        set({
          imagePreview: null,
          imageTimestamp: null,
        }),

      clearPracticeAnswer: () =>
        set({
          practiceAnswer: '',
          hasSubmittedAnswer: false,
        }),

      reset: () => set(initialState),
    }),
    {
      name: 'lensa-ui-storage',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state): PersistedUIState => ({
        activeNav: state.activeNav,
        imagePreview: state.imagePreview,
        practiceAnswer: state.practiceAnswer,
        hasSubmittedAnswer: state.hasSubmittedAnswer,
        imageTimestamp: state.imageTimestamp,
      }),
    }
  )
);

export const useUI = useUIStore;
