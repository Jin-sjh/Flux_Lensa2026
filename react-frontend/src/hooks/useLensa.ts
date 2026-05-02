import type { Annotation, OutputTask } from '../services/api';
import type { GalleryCard } from '../types/gallery';

export interface LensaState {
  userId: string;
  level: string;
  sessionId: string;
  annotations: Annotation[];
  task: OutputTask | null;
  resultImageUrl: string | null;
  status: string;
  feedback: string;
  isGenerating: boolean;
  isRendering: boolean;
  caption: string;
  galleryCards: GalleryCard[];
}

export type LensaAction =
  | { type: 'SET_USER_ID'; payload: string }
  | { type: 'SET_LEVEL'; payload: string }
  | { type: 'GENERATE_START' }
  | { type: 'GENERATE_SUCCESS'; payload: { sessionId: string; annotations: Annotation[]; task: OutputTask; caption: string } }
  | { type: 'GENERATE_ERROR'; payload: string }
  | { type: 'RENDER_START' }
  | { type: 'RENDER_SUCCESS'; payload: string | null }
  | { type: 'RENDER_ERROR'; payload: string }
  | { type: 'SET_FEEDBACK'; payload: string }
  | { type: 'ADD_GALLERY_CARD'; payload: GalleryCard }
  | { type: 'REMOVE_GALLERY_CARD'; payload: string }
  | { type: 'TOGGLE_GALLERY_CARD_COMPLETE'; payload: string }
  | { type: 'RESET' };

export const initialState: LensaState = {
  userId: 'demo_user',
  level: 'A1',
  sessionId: '',
  annotations: [],
  task: null,
  resultImageUrl: null,
  status: '📷 拍照或上传图片，开始学习印尼语',
  feedback: '',
  isGenerating: false,
  isRendering: false,
  caption: '',
  galleryCards: [],
};

export function lensaReducer(state: LensaState, action: LensaAction): LensaState {
  switch (action.type) {
    case 'SET_USER_ID':
      return { ...state, userId: action.payload };
    case 'SET_LEVEL':
      return { ...state, level: action.payload };
    case 'GENERATE_START':
      return { ...state, isGenerating: true, isRendering: false, status: '🔍 识别中，请稍候...', feedback: '', resultImageUrl: null };
    case 'GENERATE_SUCCESS':
      return { ...state, isGenerating: false, sessionId: action.payload.sessionId, annotations: action.payload.annotations, task: action.payload.task, caption: action.payload.caption, status: '✨ 标注完成，正在生成学习卡片...' };
    case 'GENERATE_ERROR':
      return { ...state, isGenerating: false, status: `⚠️ ${action.payload}` };
    case 'RENDER_START':
      return { ...state, isRendering: true, status: '🎨 正在生成学习卡片...' };
    case 'RENDER_SUCCESS':
      return { ...state, isRendering: false, resultImageUrl: action.payload, status: '🎉 学习卡片生成完成！' };
    case 'RENDER_ERROR':
      return { ...state, isRendering: false, status: `⚠️ ${action.payload}` };
    case 'SET_FEEDBACK':
      return { ...state, feedback: action.payload };
    case 'ADD_GALLERY_CARD':
      return { ...state, galleryCards: [action.payload, ...state.galleryCards] };
    case 'REMOVE_GALLERY_CARD':
      return { ...state, galleryCards: state.galleryCards.filter(card => card.id !== action.payload) };
    case 'TOGGLE_GALLERY_CARD_COMPLETE':
      return {
        ...state,
        galleryCards: state.galleryCards.map(card =>
          card.id === action.payload ? { ...card, isCompleted: !card.isCompleted } : card
        ),
      };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}
