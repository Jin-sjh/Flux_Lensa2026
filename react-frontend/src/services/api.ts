const API_BASE = import.meta.env.VITE_API_BASE || 'http://127.0.0.1:8000';
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

import { mockApi } from './mockApi';

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

export async function generateAnnotations(
  file: File,
  userId: string
): Promise<{ sessionId: string; annotations: Annotation[]; caption: string; task: OutputTask }> {
  if (USE_MOCK) return mockApi.generateAnnotations(file, userId);

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
  };
}

export async function renderImage(
  sessionId: string
): Promise<{ imageUrl: string | null }> {
  if (USE_MOCK) return mockApi.renderImage(sessionId);

  const resp = await fetch(`${API_BASE}/api/render?session_id=${encodeURIComponent(sessionId)}`);
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  const data: RenderResponse = await resp.json();
  return { imageUrl: data.rendered_image_url };
}

export async function evaluateAnswer(
  sessionId: string,
  userAnswer: string
): Promise<EvaluateResponse> {
  if (USE_MOCK) return mockApi.evaluateAnswer(sessionId, userAnswer);

  const resp = await fetch(`${API_BASE}/api/evaluate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ session_id: sessionId, user_output: userAnswer }),
  });
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  return resp.json();
}

export function getAnkiDownloadUrl(userId: string): string {
  if (USE_MOCK) return mockApi.getAnkiDownloadUrl(userId);
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
