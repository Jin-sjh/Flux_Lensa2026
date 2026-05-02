import { create } from 'zustand';
import { testQuestions } from '../data/testQuestions';
import type { TestAnswer, TestQuestion, TestResult, TestState } from '../types/auth';

const INITIAL_TEST_QUESTION_COUNT = 10;

const initialState: TestState = {
  currentQuestionIndex: 0,
  answers: [],
  isSubmitting: false,
  isCompleted: false,
  startTime: Date.now(),
};

interface TestStore extends TestState {
  questions: TestQuestion[];
  currentQuestion: TestQuestion | null;
  progress: number;
  answerQuestion: (answer: string) => void;
  nextQuestion: () => void;
  completeTest: () => TestResult;
  resetTest: () => void;
}

/**
 * 根据测试分数计算 CEFR 水平
 * 
 * 这是前端的水平计算逻辑，用于用户完成水平测试后的初步判断。
 * 
 * 计算规则：
 * - score >= 80 → B1 (中级)
 * - score >= 50 → A2 (初级)
 * - score < 50  → A1 (入门)
 * 
 * 注意：后端 (user_model.py) 有另一套基于已知词汇的计算逻辑，
 * 用于 placement_test API 和学习过程中的自动升级。
 * 两套逻辑服务于不同场景，应保持独立。
 */
function calculateCefrLevel(score: number): 'A1' | 'A2' | 'B1' {
  if (score >= 80) return 'B1';
  if (score >= 50) return 'A2';
  return 'A1';
}

function generateRecommendations(result: TestResult): string[] {
  const recommendations: string[] = [];

  if (result.vocabularyScore < 60) {
    recommendations.push('建议加强基础词汇积累，优先掌握图片学习中高频出现的名词和形容词。');
  }
  if (result.grammarScore < 60) {
    recommendations.push('建议补强基础语法，重点练习简单句、疑问句和常用时态表达。');
  }
  if (result.cefrLevel === 'A1') {
    recommendations.push('建议每天学习 5-10 个生活场景词汇，并结合图片进行复习。');
    recommendations.push('建议优先完成 A1 级别的图片描述和填空练习，建立基础表达能力。');
  } else if (result.cefrLevel === 'A2') {
    recommendations.push('建议练习更完整的场景描述，把单词扩展成简单句。');
    recommendations.push('建议在复习旧词的同时逐步引入新词，保持输入难度略高于当前水平。');
  } else {
    recommendations.push('建议尝试更自然的图片讲述，加入原因、感受和个人观点。');
    recommendations.push('建议通过连续复述和纠错练习提升表达流畅度。');
  }

  return recommendations;
}

function deriveState(state: TestState) {
  const questions = testQuestions.slice(0, INITIAL_TEST_QUESTION_COUNT);
  const currentQuestion = questions[state.currentQuestionIndex] || null;
  const progress = ((state.currentQuestionIndex + 1) / questions.length) * 100;

  return { questions, currentQuestion, progress };
}

export const useTestStore = create<TestStore>((set, get) => ({
  ...initialState,
  ...deriveState(initialState),

  answerQuestion: (answer) => {
    const { currentQuestion } = get();
    if (!currentQuestion) return;

    const testAnswer: TestAnswer = {
      questionId: currentQuestion.id,
      selectedAnswer: answer,
      isCorrect: answer === currentQuestion.correctAnswer,
    };

    set((state) => ({
      answers: [...state.answers, testAnswer],
    }));
  },

  nextQuestion: () => {
    const { currentQuestionIndex, questions } = get();
    if (currentQuestionIndex >= questions.length - 1) return;

    set((state) => {
      const nextState = {
        ...state,
        currentQuestionIndex: state.currentQuestionIndex + 1,
      };
      return {
        currentQuestionIndex: nextState.currentQuestionIndex,
        ...deriveState(nextState),
      };
    });
  },

  completeTest: () => {
    const endTime = Date.now();
    const { answers, questions } = get();

    set({ isCompleted: true, isSubmitting: false, endTime });

    const correctAnswers = answers.filter((answer) => answer.isCorrect).length;
    const totalQuestions = questions.length;
    const score = Math.round((correctAnswers / totalQuestions) * 100);

    const vocabularyQuestions = questions.filter((question) => question.questionType === 'vocabulary');
    const grammarQuestions = questions.filter((question) => question.questionType === 'grammar');

    const vocabularyCorrect = answers.filter(
      (answer) => answer.isCorrect && vocabularyQuestions.some((question) => question.id === answer.questionId),
    ).length;
    const grammarCorrect = answers.filter(
      (answer) => answer.isCorrect && grammarQuestions.some((question) => question.id === answer.questionId),
    ).length;

    const vocabularyScore = vocabularyQuestions.length > 0
      ? Math.round((vocabularyCorrect / vocabularyQuestions.length) * 100)
      : 0;
    const grammarScore = grammarQuestions.length > 0
      ? Math.round((grammarCorrect / grammarQuestions.length) * 100)
      : 0;

    const result: TestResult = {
      totalQuestions,
      correctAnswers,
      score,
      cefrLevel: calculateCefrLevel(score),
      vocabularyScore,
      grammarScore,
      recommendations: [],
      completedAt: new Date().toISOString(),
    };

    result.recommendations = generateRecommendations(result);

    return result;
  },

  resetTest: () => {
    const nextState = { ...initialState, startTime: Date.now() };
    set({
      ...nextState,
      ...deriveState(nextState),
    });
  },
}));

export const useTest = useTestStore;
