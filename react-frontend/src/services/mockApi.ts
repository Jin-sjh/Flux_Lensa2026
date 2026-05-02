import type { Annotation, EvaluateResponse, OutputTask } from './api';
import {
  mockScenarios,
  getRandomScenario,
  generateMockGenerateResponse,
  generateMockRenderResponse,
  generateMockEvaluateResponse,
  type MockScenario,
} from './mockData';

const MOCK_DELAY_MIN = 500;
const MOCK_DELAY_MAX = 2000;
const RENDER_DELAY_MIN = 3000;
const RENDER_DELAY_MAX = 6000;

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function randomDelay(min: number, max: number): Promise<void> {
  const ms = Math.floor(Math.random() * (max - min + 1)) + min;
  return delay(ms);
}

class MockApiService {
  private currentScenario: MockScenario | null = null;

  async generateAnnotations(
    _file: File,
    _userId: string
  ): Promise<{ sessionId: string; annotations: Annotation[]; caption: string; task: OutputTask }> {
    await randomDelay(MOCK_DELAY_MIN, MOCK_DELAY_MAX);

    this.currentScenario = getRandomScenario();
    const response = generateMockGenerateResponse(this.currentScenario);

    return {
      sessionId: response.session_id,
      annotations: response.annotations,
      caption: response.caption,
      task: response.output_task,  // 现在是 OutputTask 对象
    };
  }

  async renderImage(
    _sessionId: string
  ): Promise<{ imageUrl: string | null }> {
    await randomDelay(RENDER_DELAY_MIN, RENDER_DELAY_MAX);

    const response = generateMockRenderResponse();

    return {
      imageUrl: response.rendered_image_url,
    };
  }

  async evaluateAnswer(
    _sessionId: string,
    userAnswer: string
  ): Promise<EvaluateResponse> {
    await randomDelay(MOCK_DELAY_MIN, MOCK_DELAY_MIN);

    if (!this.currentScenario) {
      throw new Error('No active session');
    }

    return generateMockEvaluateResponse(this.currentScenario, userAnswer);
  }

  getAnkiDownloadUrl(_userId: string): string {
    return `data:application/octet-stream;base64,UEsDBBQAAAAIAAAAAIAAAAAAAAAAAAAAAAAWAAAAZXhwYW5kZWQvcGtncGsvUEsDBBQAAAAIAAAAACAAAAAAAAAAAAAAAAAAbAAAAZXhwYW5kZWQvcGtnc2svUEsDBBQAAAAIAAAAACAAAAAAAAAAAAAAAAAAdAAAAZXhwYW5kZWQvcGtnc2svMQBQSwMEFAAAAAgAAAAAIAAAAAAAAAAAAAAAAABoAAABleHBhbmRlZC9wa2dzay8xLzEudHh0VU0EAQAAAgMAAABQSwMECgAAAAAAAAAAAAAAYAAAAAAAAAAAAAAWAAAAUEsDBBQAAAAIAAAAACAAAAAAAAAAAAAAAAAAdAAAAZXhwYW5kZWQvcGtnc2svMi9QSwMEFAAAAAgAAAAAIAAAAAAAAAAAAAAAAABoAAABleHBhbmRlZC9wa2dzay8yLzEudHh0VU0EAQAAAgMAAABQSwMECgAAAAAAAAAAAAAAYAAAAAAAAAAAAAAbAAAAUEsDBBQAAAAIAAAAACAAAAAAAAAAAAAAAAAAdAAAAZXhwYW5kZWQvcGtnc2svMy9QSwMEFAAAAAgAAAAAIAAAAAAAAAAAAAAAAABoAAABleHBhbmRlZC9wa2dzay8zLzEudHh0VU0EAQAAAgMAAABQSwMECgAAAAAAAAAAAAAAYAAAAAAAAAAAAAAdAAAAUEsDBBQAAAAIAAAAACAAAAAAAAAAAAAAAAAcAAABleHBhbmRlZC9tZWRpYS8wLmpwZ1VNAQEAAAIDAQAAUEsDBBQAAAAIAAAAACAAAAAAAAAAAAAAAAAUAAAAn9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/wAALCAABAAEBAREA/8QAFAABAAAAAAAAAAAAAAAAAAAACf/EABQQAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQEAAD8AKp//2Q==`;
  }

  getAllScenarios(): MockScenario[] {
    return mockScenarios;
  }

  setScenario(scenarioId: string): void {
    const scenario = mockScenarios.find(s => s.id === scenarioId);
    if (scenario) {
      this.currentScenario = scenario;
    }
  }
}

export const mockApi = new MockApiService();