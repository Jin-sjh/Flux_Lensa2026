const API_BASE = import.meta.env.VITE_API_BASE || 'https://placeholder.ngrok.io';
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true' || import.meta.env.DEV;

import { mockApi } from './mockApi';

export interface Annotation {
  object: string;
  label: string;
  new_words: string[];
}

export interface GenerateResponse {
  session_id: string;
  annotations: Annotation[];
  caption: string;
  output_task: string;
}

export interface RenderResponse {
  rendered_image_url: string;
}

export interface EvaluateResponse {
  is_correct: boolean;
  feedback: string;
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
      const dataUrl = canvas.toDataURL('image/jpeg', JPEG_QUALITY);
      resolve(dataUrl.split(',')[1]);
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

export async function generateAnnotations(
  file: File,
  userId: string
): Promise<{ sessionId: string; annotations: Annotation[]; status: string; task: string; caption: string }> {
  if (USE_MOCK) {
    return mockApi.generateAnnotations(file, userId);
  }
  
  const b64 = await compressImage(file);
  const resp = await fetch(`${API_BASE}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: userId, image: b64, mode: 'annotation' }),
  });
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  const data: GenerateResponse = await resp.json();
  return {
    sessionId: data.session_id || '',
    annotations: data.annotations || [],
    status: '✨ 标注完成，正在生成学习卡片...',
    task: data.output_task || '暂无练习',
    caption: data.caption || '',
  };
}

export async function renderImage(
  sessionId: string
): Promise<{ imageUrl: string; status: string }> {
  if (USE_MOCK) {
    return mockApi.renderImage(sessionId);
  }
  
  const resp = await fetch(`${API_BASE}/api/render?session_id=${sessionId}`);
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  const data: RenderResponse = await resp.json();
  if (!data.rendered_image_url) throw new Error('美图 URL 为空');
  return { imageUrl: data.rendered_image_url, status: '🎉 学习卡片生成完成！' };
}

export async function evaluateAnswer(
  sessionId: string,
  userAnswer: string
): Promise<string> {
  if (USE_MOCK) {
    return mockApi.evaluateAnswer(sessionId, userAnswer);
  }
  
  const resp = await fetch(`${API_BASE}/api/evaluate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ session_id: sessionId, user_output: userAnswer }),
  });
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  const data: EvaluateResponse = await resp.json();
  if (data.is_correct) return `✅ Benar! ${data.feedback || ''}`;
  return `🔄 Coba lagi: ${data.feedback || ''}`;
}

export function getAnkiDownloadUrl(userId: string): string {
  if (USE_MOCK) {
    return mockApi.getAnkiDownloadUrl(userId);
  }
  
  return `${API_BASE}/api/export_anki?user_id=${encodeURIComponent(userId)}`;
}
