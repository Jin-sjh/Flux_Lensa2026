import type { Annotation, OutputTask } from '../services/api';

export interface LensaState {
  userId: string;
  level: string;
  sessionId: string;
  annotations: Annotation[];
  caption: string;
  task: OutputTask | null;
  resultImageUrl: string;
  status: string;
  feedback: string;
  isGenerating: boolean;
  isRendering: boolean;
  phase: 'upload' | 'practice';  // ← 新增：控制显示哪个页面
}

export type LensaAction =
  | { type: 'SET_USER_ID'; payload: string }
  | { type: 'SET_LEVEL'; payload: string }
  | { type: 'GENERATE_START' }
  | { type: 'GENERATE_SUCCESS'; payload: { sessionId: string; annotations: Annotation[]; caption: string; task: OutputTask } }
  | { type: 'GENERATE_ERROR'; payload: string }
  | { type: 'RENDER_START' }
  | { type: 'RENDER_SUCCESS'; payload: string | null }
  | { type: 'RENDER_ERROR'; payload: string }
  | { type: 'SET_FEEDBACK'; payload: string }
  | { type: 'RESET' };

export const initialState: LensaState = {
  userId: 'demo_user',
  level: 'A1',
  sessionId: '',
  annotations: [],
  caption: '',
  task: null,
  resultImageUrl: '',
  status: '拍照或上传图片，开始学习印尼语',
  feedback: '',
  isGenerating: false,
  isRendering: false,
  phase: 'upload',
};

export function lensaReducer(state: LensaState, action: LensaAction): LensaState {
  switch (action.type) {
    case 'SET_USER_ID':
      return { ...state, userId: action.payload };
    case 'SET_LEVEL':
      return { ...state, level: action.payload };
    case 'GENERATE_START':
      return { ...state, isGenerating: true, isRendering: false, status: '识别中，请稍候...', feedback: '', resultImageUrl: '' };
    case 'GENERATE_SUCCESS':
      return {
        ...state,
        isGenerating: false,
        sessionId: action.payload.sessionId,
        annotations: action.payload.annotations,
        caption: action.payload.caption,
        task: action.payload.task,
        status: '标注完成，正在生成学习卡片...',
        phase: 'practice',  // ← 关键：切换到练习页面
      };
    case 'GENERATE_ERROR':
      return { ...state, isGenerating: false, status: `${action.payload}` };
    case 'RENDER_START':
      return { ...state, isRendering: true };
    case 'RENDER_SUCCESS':
      return { ...state, isRendering: false, resultImageUrl: action.payload ?? '', status: '学习卡片生成完成！' };
    case 'RENDER_ERROR':
      return { ...state, isRendering: false, status: `${action.payload}` };
    case 'SET_FEEDBACK':
      return { ...state, feedback: action.payload };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}