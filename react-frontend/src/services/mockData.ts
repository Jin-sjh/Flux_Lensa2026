import type { Annotation, GenerateResponse, RenderResponse, EvaluateResponse } from './api';
import type { GalleryCard } from '../types/gallery';

export interface MockScenario {
  id: string;
  name: string;
  description: string;
  annotations: Annotation[];
  caption: string;
  outputTask: string;
  feedback: {
    correct: string;
    incorrect: string;
  };
}

export const mockScenarios: MockScenario[] = [
  {
    id: 'table',
    name: '桌子场景',
    description: '一张木制桌子',
    annotations: [
      {
        object: 'meja',
        label: '桌子',
        new_words: ['meja', 'dari', 'kayu'],
      },
    ],
    caption: '这是一张木制桌子',
    outputTask: 'Ini adalah ____ (桌子)',
    feedback: {
      correct: '非常好！meja 是桌子的意思',
      incorrect: '提示：这是一个家具，有四条腿',
    },
  },
  {
    id: 'book',
    name: '书本场景',
    description: '一本印尼语学习书',
    annotations: [
      {
        object: 'buku',
        label: '书',
        new_words: ['buku', 'bahasa', 'Indonesia'],
      },
    ],
    caption: '这是一本印尼语学习书',
    outputTask: 'Saya membaca ____ (书)',
    feedback: {
      correct: '太棒了！buku 是书的意思',
      incorrect: '提示：这是用来阅读的物品',
    },
  },
  {
    id: 'apple',
    name: '苹果场景',
    description: '一个红色的苹果',
    annotations: [
      {
        object: 'apel',
        label: '苹果',
        new_words: ['apel', 'merah', 'buah'],
      },
    ],
    caption: '这是一个红色的苹果',
    outputTask: 'Saya makan ____ (苹果)',
    feedback: {
      correct: '正确！apel 是苹果的意思',
      incorrect: '提示：这是一种红色的水果',
    },
  },
  {
    id: 'motorcycle',
    name: '摩托车场景',
    description: '一辆停在路边的摩托车',
    annotations: [
      {
        object: 'motor',
        label: '摩托车',
        new_words: ['motor', 'jalan', 'roda'],
      },
    ],
    caption: '这是一辆摩托车',
    outputTask: 'Dia naik ____ (摩托车)',
    feedback: {
      correct: '很好！motor 是摩托车的意思',
      incorrect: '提示：这是一种两轮交通工具',
    },
  },
  {
    id: 'coffee',
    name: '咖啡场景',
    description: '一杯热咖啡',
    annotations: [
      {
        object: 'kopi',
        label: '咖啡',
        new_words: ['kopi', 'panas', 'minum'],
      },
    ],
    caption: '这是一杯热咖啡',
    outputTask: 'Saya minum ____ (咖啡)',
    feedback: {
      correct: '正确！kopi 是咖啡的意思',
      incorrect: '提示：这是一种热饮',
    },
  },
  {
    id: 'house',
    name: '房屋场景',
    description: '一栋漂亮的房子',
    annotations: [
      {
        object: 'rumah',
        label: '房子',
        new_words: ['rumah', 'tinggal', 'bagus'],
      },
    ],
    caption: '这是一栋漂亮的房子',
    outputTask: 'Saya ____ (住) di rumah',
    feedback: {
      correct: '太好了！rumah 是房子的意思',
      incorrect: '提示：这是人们居住的地方',
    },
  },
  {
    id: 'water',
    name: '水场景',
    description: '一瓶矿泉水',
    annotations: [
      {
        object: 'air',
        label: '水',
        new_words: ['air', 'mineral', 'botol'],
      },
    ],
    caption: '这是一瓶矿泉水',
    outputTask: 'Saya minum ____ (水)',
    feedback: {
      correct: '非常好！air 是水的意思',
      incorrect: '提示：这是生命必需的液体',
    },
  },
  {
    id: 'phone',
    name: '手机场景',
    description: '一部智能手机',
    annotations: [
      {
        object: 'ponsel',
        label: '手机',
        new_words: ['ponsel', 'pintar', 'telepon'],
      },
    ],
    caption: '这是一部智能手机',
    outputTask: 'Saya menggunakan ____ (手机)',
    feedback: {
      correct: '正确！ponsel 是手机的意思',
      incorrect: '提示：这是用来打电话和上网的设备',
    },
  },
];

export function generateMockSessionId(): string {
  return `mock-session-${Date.now()}-${Math.random().toString(36).substring(7)}`;
}

export function generateMockGenerateResponse(scenario: MockScenario): GenerateResponse {
  return {
    session_id: generateMockSessionId(),
    annotations: scenario.annotations,
    caption: scenario.caption,
    output_task: scenario.outputTask,
  };
}

export function generateMockRenderResponse(): RenderResponse {
  const mockImages = [
    'https://images.unsplash.com/photo-1555041469-a276029a8a3d?w=800',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800',
    'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800',
    'https://images.unsplash.com/photo-1493934558415-9d19f0b2b4d2?w=800',
    'https://images.unsplash.com/photo-1516466723877-e4ec1d736c8a?w=800',
  ];
  
  const randomImage = mockImages[Math.floor(Math.random() * mockImages.length)];
  
  return {
    rendered_image_url: randomImage,
  };
}

export function generateMockEvaluateResponse(
  scenario: MockScenario,
  userAnswer: string
): EvaluateResponse {
  const correctAnswer = scenario.annotations[0].object.toLowerCase();
  const isCorrect = userAnswer.toLowerCase().trim() === correctAnswer;
  
  return {
    is_correct: isCorrect,
    feedback: isCorrect ? scenario.feedback.correct : scenario.feedback.incorrect,
  };
}

export function getRandomScenario(): MockScenario {
  return mockScenarios[Math.floor(Math.random() * mockScenarios.length)];
}

export const mockGalleryCards: GalleryCard[] = [
  {
    id: 'mock-card-1',
    imageUrl: 'https://images.unsplash.com/photo-1555041469-a276029a8a3d?w=800',
    annotations: [{ object: 'meja', label: '桌子', new_words: ['meja', 'dari', 'kayu'] }],
    caption: '这是一张木制桌子',
    task: 'Ini adalah ____ (桌子)',
    sessionId: 'mock-session-table',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    isCompleted: true,
  },
  {
    id: 'mock-card-2',
    imageUrl: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800',
    annotations: [{ object: 'kopi', label: '咖啡', new_words: ['kopi', 'panas', 'minum'] }],
    caption: '这是一杯热咖啡',
    task: 'Saya minum ____ (咖啡)',
    sessionId: 'mock-session-coffee',
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    isCompleted: true,
  },
  {
    id: 'mock-card-3',
    imageUrl: 'https://images.unsplash.com/photo-1493934558415-9d19f0b2b4d2?w=800',
    annotations: [{ object: 'buku', label: '书', new_words: ['buku', 'bahasa', 'Indonesia'] }],
    caption: '这是一本印尼语学习书',
    task: 'Saya membaca ____ (书)',
    sessionId: 'mock-session-book',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    isCompleted: false,
  },
  {
    id: 'mock-card-4',
    imageUrl: 'https://images.unsplash.com/photo-1516466723877-e4ec1d736c8a?w=800',
    annotations: [{ object: 'apel', label: '苹果', new_words: ['apel', 'merah', 'buah'] }],
    caption: '这是一个红色的苹果',
    task: 'Saya makan ____ (苹果)',
    sessionId: 'mock-session-apple',
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    isCompleted: true,
  },
  {
    id: 'mock-card-5',
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800',
    annotations: [{ object: 'motor', label: '摩托车', new_words: ['motor', 'jalan', 'roda'] }],
    caption: '这是一辆摩托车',
    task: 'Dia naik ____ (摩托车)',
    sessionId: 'mock-session-motorcycle',
    createdAt: new Date(Date.now() - 259200000).toISOString(),
    isCompleted: false,
  },
  {
    id: 'mock-card-6',
    imageUrl: 'https://images.unsplash.com/photo-1555041469-a276029a8a3d?w=800',
    annotations: [{ object: 'rumah', label: '房子', new_words: ['rumah', 'tinggal', 'bagus'] }],
    caption: '这是一栋漂亮的房子',
    task: 'Saya ____ (住) di rumah',
    sessionId: 'mock-session-house',
    createdAt: new Date(Date.now() - 345600000).toISOString(),
    isCompleted: true,
  },
];
