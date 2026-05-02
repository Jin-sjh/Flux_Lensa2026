import type { Annotation, GenerateResponse, RenderResponse, EvaluateResponse } from './api';

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
        new_words: [
          { word: 'meja', translation_zh: '桌子', translation_en: 'table' },
          { word: 'dari', translation_zh: '从/由', translation_en: 'from' },
          { word: 'kayu', translation_zh: '木头', translation_en: 'wood' },
        ],
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
        new_words: [
          { word: 'buku', translation_zh: '书', translation_en: 'book' },
          { word: 'bahasa', translation_zh: '语言', translation_en: 'language' },
          { word: 'Indonesia', translation_zh: '印度尼西亚', translation_en: 'Indonesia' },
        ],
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
        new_words: [
          { word: 'apel', translation_zh: '苹果', translation_en: 'apple' },
          { word: 'merah', translation_zh: '红色', translation_en: 'red' },
          { word: 'buah', translation_zh: '水果', translation_en: 'fruit' },
        ],
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
        new_words: [
          { word: 'motor', translation_zh: '摩托车', translation_en: 'motorcycle' },
          { word: 'jalan', translation_zh: '道路', translation_en: 'road' },
          { word: 'roda', translation_zh: '轮子', translation_en: 'wheel' },
        ],
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
        new_words: [
          { word: 'kopi', translation_zh: '咖啡', translation_en: 'coffee' },
          { word: 'panas', translation_zh: '热', translation_en: 'hot' },
          { word: 'minum', translation_zh: '喝', translation_en: 'drink' },
        ],
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
        new_words: [
          { word: 'rumah', translation_zh: '房子', translation_en: 'house' },
          { word: 'tinggal', translation_zh: '居住', translation_en: 'live' },
          { word: 'bagus', translation_zh: '漂亮', translation_en: 'nice' },
        ],
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
        new_words: [
          { word: 'air', translation_zh: '水', translation_en: 'water' },
          { word: 'mineral', translation_zh: '矿物质', translation_en: 'mineral' },
          { word: 'botol', translation_zh: '瓶子', translation_en: 'bottle' },
        ],
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
        new_words: [
          { word: 'ponsel', translation_zh: '手机', translation_en: 'phone' },
          { word: 'pintar', translation_zh: '智能', translation_en: 'smart' },
          { word: 'telepon', translation_zh: '电话', translation_en: 'telephone' },
        ],
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
    output_task: {
      type: 'fill_blank' as const,
      prompt: scenario.outputTask,
      answer: scenario.annotations[0].object,
    },
    rendered_image_url: null,
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
    words_updated: [],
    cefr_upgraded: null,
  };
}

export function getRandomScenario(): MockScenario {
  return mockScenarios[Math.floor(Math.random() * mockScenarios.length)];
}
