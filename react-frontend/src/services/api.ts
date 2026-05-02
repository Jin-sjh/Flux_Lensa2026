const API_BASE = import.meta.env.VITE_API_BASE || 'http://127.0.0.1:8000';
const API_ORIGIN = API_BASE.replace(/\/$/, '');

export interface NewWord {
  word: string;
  translation_zh: string;
  translation_en: string;
}

export interface Annotation {
  object: string;
  label: string;
  new_words: NewWord[];
}

export interface OutputTask {
  type: 'fill_blank';
  prompt: string;
  answer: string;
}

export interface GenerateResponse {
  session_id: string;
  annotations: Annotation[];
  caption: string;
  output_task: OutputTask;
  rendered_image_url: string | null;
}

export interface RenderResponse {
  rendered_image_url: string | null;
  annotations?: Annotation[];
}

export interface EvaluateResponse {
  is_correct: boolean;
  feedback: string;
  words_updated: string[];
  cefr_upgraded: string | null;
}

export interface UserResponse {
  user_id: string;
  estimated_cefr: string;
  learned_word_count: number;
}

const MAX_IMAGE_SIZE = 1280;
const JPEG_QUALITY = 0.85;

function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let { width, height } = img;
      if (width > MAX_IMAGE_SIZE || height > MAX_IMAGE_SIZE) {
        const ratio = Math.min(MAX_IMAGE_SIZE / width, MAX_IMAGE_SIZE / height);
        width *= ratio;
        height *= ratio;
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', JPEG_QUALITY).split(',')[1]);
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

function normalizeImageUrl(url: string | null): string {
  if (!url) throw new Error('后端没有返回生成图片地址');

  if (url.startsWith('/')) {
    return `${API_ORIGIN}${url}`;
  }

  const parsed = new URL(url);
  if (['localhost', '127.0.0.1'].includes(parsed.hostname)) {
    const api = new URL(API_ORIGIN);
    if (api.origin !== parsed.origin) {
      return `${api.origin}${parsed.pathname}${parsed.search}${parsed.hash}`;
    }
  }

  return url;
}

export async function generateAnnotations(
  file: File,
  userId: string
): Promise<{ sessionId: string; annotations: Annotation[]; caption: string; task: OutputTask; renderedImageUrl: string | null }> {
  const b64 = await compressImage(file);
  const resp = await fetch(`${API_BASE}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: userId, image: b64, mode: 'annotation' }),
  });
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  const data: GenerateResponse = await resp.json();
  return {
    sessionId: data.session_id,
    annotations: data.annotations,
    caption: data.caption,
    task: data.output_task,
    renderedImageUrl: data.rendered_image_url ? normalizeImageUrl(data.rendered_image_url) : null,
  };
}

export async function renderImage(
  sessionId: string
): Promise<{ imageUrl: string }> {
  const resp = await fetch(`${API_BASE}/api/render?session_id=${encodeURIComponent(sessionId)}`);
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  const data: RenderResponse = await resp.json();
  return { imageUrl: normalizeImageUrl(data.rendered_image_url) };
}

export async function evaluateAnswer(
  sessionId: string,
  userAnswer: string
): Promise<EvaluateResponse> {
  const resp = await fetch(`${API_BASE}/api/evaluate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ session_id: sessionId, user_output: userAnswer }),
  });
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  return resp.json();
}

export function getAnkiDownloadUrl(userId: string): string {
  return `${API_BASE}/api/export_anki?user_id=${encodeURIComponent(userId)}`;
}

export async function createUser(userId?: string, cefr = 'A1'): Promise<UserResponse> {
  const resp = await fetch(`${API_BASE}/api/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: userId ?? null, cefr }),
  });
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  return resp.json();
}

export async function getUser(userId: string): Promise<UserResponse> {
  const resp = await fetch(`${API_BASE}/api/users/${encodeURIComponent(userId)}`);
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  return resp.json();
}

export interface SessionListItem {
  session_id: string;
  user_id: string;
  image_path: string | null;
  rendered_image_path: string | null;
  thumbnail_path: string | null;
  caption: string | null;
  new_vocab: string[];
  output_task: {
    type: 'fill_blank';
    prompt: string;
    answer: string;
  } | null;
  user_output: string | null;
  feedback: {
    is_correct: boolean;
    expected: string;
    user_answer: string;
  } | null;
  completed: boolean;
  created_at: string;
}

export interface SessionListResponse {
  sessions: SessionListItem[];
  total: number;
}

export interface SessionDetail {
  session_id: string;
  user_id: string;
  image_path: string | null;
  rendered_image_path: string | null;
  generated_content: Record<string, unknown> | null;
  caption: string | null;
  annotations: Annotation[];
  new_vocab: string[];
  output_task: OutputTask | null;
  user_output: string | null;
  feedback: Record<string, unknown> | null;
  completed: boolean;
  created_at: string;
}

export interface VocabularyItem {
  word: string;
  status: 'learning' | 'learned' | 'mastered';
  translation_zh: string | null;
  translation_en: string | null;
  last_seen_at: string | null;
  next_review_at: string | null;
  interval: number;
  ease_factor: number;
}

export interface VocabularyListResponse {
  vocabulary: VocabularyItem[];
  total: number;
}

export interface CompleteSessionResponse {
  session_id: string;
  completed: boolean;
  message: string;
}

export interface DeleteSessionResponse {
  session_id: string;
  deleted: boolean;
  message: string;
}

export interface UpdateSessionRequest {
  caption?: string;
  completed?: boolean;
}

export async function fetchSessions(userId: string): Promise<SessionListResponse> {
  const resp = await fetch(`${API_BASE}/api/sessions?user_id=${encodeURIComponent(userId)}`);
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  return resp.json();
}

export async function fetchSessionDetail(sessionId: string): Promise<SessionDetail> {
  const resp = await fetch(`${API_BASE}/api/sessions/${encodeURIComponent(sessionId)}`);
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  return resp.json();
}

export async function completeSession(sessionId: string): Promise<CompleteSessionResponse> {
  const resp = await fetch(`${API_BASE}/api/sessions/${encodeURIComponent(sessionId)}/complete`, {
    method: 'POST',
  });
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  return resp.json();
}

export async function fetchVocabulary(userId: string): Promise<VocabularyListResponse> {
  const resp = await fetch(`${API_BASE}/api/vocabulary?user_id=${encodeURIComponent(userId)}`);
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  return resp.json();
}

export async function deleteSession(sessionId: string): Promise<DeleteSessionResponse> {
  const resp = await fetch(`${API_BASE}/api/sessions/${encodeURIComponent(sessionId)}`, {
    method: 'DELETE',
  });
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  return resp.json();
}

export async function updateSession(
  sessionId: string,
  updates: UpdateSessionRequest
): Promise<SessionDetail> {
  const resp = await fetch(`${API_BASE}/api/sessions/${encodeURIComponent(sessionId)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  return resp.json();
}
