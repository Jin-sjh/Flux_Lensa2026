import { useReducer, useCallback } from 'react';
import { lensaReducer, initialState } from '../hooks/useLensa';
import { generateAnnotations, renderImage, evaluateAnswer, getAnkiDownloadUrl } from '../services/api';
import type { GalleryCard } from '../types/gallery';

export function useLensaApp() {
  const [state, dispatch] = useReducer(lensaReducer, initialState);

  const handleGenerate = useCallback(async (file: File) => {
    dispatch({ type: 'GENERATE_START' });
    try {
      const result = await generateAnnotations(file, state.userId);
      dispatch({ type: 'GENERATE_SUCCESS', payload: result });
      dispatch({ type: 'RENDER_START' });
      try {
        const renderResult = await renderImage(result.sessionId);
        dispatch({ type: 'RENDER_SUCCESS', payload: renderResult.imageUrl });

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
        dispatch({ type: 'ADD_GALLERY_CARD', payload: galleryCard });
      } catch (err: any) {
        dispatch({ type: 'RENDER_ERROR', payload: err.message || '渲染失败' });
      }
    } catch (err: any) {
      dispatch({ type: 'GENERATE_ERROR', payload: err.message || '生成失败' });
    }
  }, [state.userId]);

  const handleSubmitAnswer = useCallback(async (answer: string) => {
    if (!state.sessionId) {
      dispatch({ type: 'SET_FEEDBACK', payload: '请先生成内容' });
      return;
    }
    if (!answer.trim()) {
      dispatch({ type: 'SET_FEEDBACK', payload: '请输入你的回答' });
      return;
    }
    try {
      const feedback = await evaluateAnswer(state.sessionId, answer);
      dispatch({ type: 'SET_FEEDBACK', payload: feedback });
    } catch (err: any) {
      dispatch({ type: 'SET_FEEDBACK', payload: `⚠️ 评估失败：${err.message}` });
    }
  }, [state.sessionId]);

  const ankiUrl = getAnkiDownloadUrl(state.userId);

  return { state, dispatch, handleGenerate, handleSubmitAnswer, ankiUrl };
}
