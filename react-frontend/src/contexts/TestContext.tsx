import { createContext, useContext, useReducer } from 'react';
import type { ReactNode } from 'react';
import { testQuestions } from '../data/testQuestions';
import type { TestState, TestAnswer, TestResult, TestQuestion } from '../types/auth';

const INITIAL_TEST_QUESTION_COUNT = 10;

type TestAction =
  | { type: 'START_TEST'; payload: number }
  | { type: 'ANSWER_QUESTION'; payload: TestAnswer }
  | { type: 'NEXT_QUESTION' }
  | { type: 'COMPLETE_TEST'; payload: number }
  | { type: 'RESET_TEST' };

const initialState: TestState = {
  currentQuestionIndex: 0,
  answers: [],
  isSubmitting: false,
  isCompleted: false,
  startTime: Date.now(),
};

function testReducer(state: TestState, action: TestAction): TestState {
  switch (action.type) {
    case 'START_TEST':
      return { ...initialState, startTime: action.payload };
    case 'ANSWER_QUESTION':
      return {
        ...state,
        answers: [...state.answers, action.payload],
      };
    case 'NEXT_QUESTION':
      return {
        ...state,
        currentQuestionIndex: state.currentQuestionIndex + 1,
      };
    case 'COMPLETE_TEST':
      return {
        ...state,
        isCompleted: true,
        isSubmitting: false,
        endTime: action.payload,
      };
    case 'RESET_TEST':
      return initialState;
    default:
      return state;
  }
}

interface TestContextType extends TestState {
  questions: TestQuestion[];
  currentQuestion: TestQuestion | null;
  progress: number;
  answerQuestion: (answer: string) => void;
  nextQuestion: () => void;
  completeTest: () => TestResult;
  resetTest: () => void;
}

const TestContext = createContext<TestContextType | undefined>(undefined);

export function TestProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(testReducer, initialState);

  const questions = testQuestions.slice(0, INITIAL_TEST_QUESTION_COUNT);
  const currentQuestion = questions[state.currentQuestionIndex] || null;
  const progress = ((state.currentQuestionIndex + 1) / questions.length) * 100;

  const answerQuestion = (answer: string) => {
    if (!currentQuestion) return;

    const testAnswer: TestAnswer = {
      questionId: currentQuestion.id,
      selectedAnswer: answer,
      isCorrect: answer === currentQuestion.correctAnswer,
    };

    dispatch({ type: 'ANSWER_QUESTION', payload: testAnswer });
  };

  const nextQuestion = () => {
    if (state.currentQuestionIndex < questions.length - 1) {
      dispatch({ type: 'NEXT_QUESTION' });
    }
  };

  const calculateCefrLevel = (score: number): 'A1' | 'A2' | 'B1' => {
    if (score >= 80) return 'B1';
    if (score >= 50) return 'A2';
    return 'A1';
  };

  const generateRecommendations = (result: TestResult): string[] => {
    const recommendations: string[] = [];

    if (result.vocabularyScore < 60) {
      recommendations.push('建议多进行词汇学习，可以通过拍照识别日常物品来扩展词汇量。');
    }
    if (result.grammarScore < 60) {
      recommendations.push('建议加强语法练习，重点关注印尼语的基本句型和常用连接词。');
    }
    if (result.cefrLevel === 'A1') {
      recommendations.push('建议从基础问候、数字、食物和家庭词汇开始，每天学习 5-10 个新词。');
      recommendations.push('可以结合图片和例句做间隔复习，先把日常高频表达记牢。');
    } else if (result.cefrLevel === 'A2') {
      recommendations.push('可以开始尝试简单的印尼语对话练习，例如点餐、问路和自我介绍。');
      recommendations.push('建议阅读短篇文章或生活场景对话，积累常见动词和表达方式。');
    } else {
      recommendations.push('可以尝试更复杂的印尼语对话和阅读材料，训练长句理解能力。');
      recommendations.push('建议关注进阶语法、语气表达和真实语境中的固定搭配。');
    }

    return recommendations;
  };

  const completeTest = (): TestResult => {
    const endTime = Date.now();
    dispatch({ type: 'COMPLETE_TEST', payload: endTime });

    const correctAnswers = state.answers.filter(a => a.isCorrect).length;
    const totalQuestions = questions.length;
    const score = Math.round((correctAnswers / totalQuestions) * 100);

    const vocabularyQuestions = questions.filter(q => q.questionType === 'vocabulary');
    const grammarQuestions = questions.filter(q => q.questionType === 'grammar');

    const vocabularyCorrect = state.answers.filter(
      a => a.isCorrect && vocabularyQuestions.some(q => q.id === a.questionId)
    ).length;
    const grammarCorrect = state.answers.filter(
      a => a.isCorrect && grammarQuestions.some(q => q.id === a.questionId)
    ).length;

    const vocabularyScore = vocabularyQuestions.length > 0
      ? Math.round((vocabularyCorrect / vocabularyQuestions.length) * 100)
      : 0;
    const grammarScore = grammarQuestions.length > 0
      ? Math.round((grammarCorrect / grammarQuestions.length) * 100)
      : 0;

    const cefrLevel = calculateCefrLevel(score);

    const result: TestResult = {
      totalQuestions,
      correctAnswers,
      score,
      cefrLevel,
      vocabularyScore,
      grammarScore,
      recommendations: [],
      completedAt: new Date().toISOString(),
    };

    result.recommendations = generateRecommendations(result);

    return result;
  };

  const resetTest = () => {
    dispatch({ type: 'RESET_TEST' });
  };

  return (
    <TestContext.Provider
      value={{
        ...state,
        questions,
        currentQuestion,
        progress,
        answerQuestion,
        nextQuestion,
        completeTest,
        resetTest,
      }}
    >
      {children}
    </TestContext.Provider>
  );
}

export function useTest() {
  const context = useContext(TestContext);
  if (context === undefined) {
    throw new Error('useTest must be used within a TestProvider');
  }
  return context;
}
