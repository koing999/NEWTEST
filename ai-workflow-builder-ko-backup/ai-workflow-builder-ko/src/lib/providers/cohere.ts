/**
 * Cohere 프로바이더
 * 
 * Command 모델과 통합합니다.
 * 
 * @author AI 워크플로우 빌더 팀
 * @license MIT
 */

import { LLMRequest, LLMResponse } from '@/types/workflow';
import { LLMProviderBase } from './base';

const API_ENDPOINT = 'https://api.cohere.ai/v1/chat';

export class CohereProvider extends LLMProviderBase {
  constructor(apiKey: string) {
    super({ apiKey });
  }

  async call(request: LLMRequest): Promise<LLMResponse> {
    const startTime = Date.now();

    // Cohere 형식으로 변환
    const systemMessage = request.messages.find(m => m.role === 'system');
    const userMessages = request.messages.filter(m => m.role !== 'system');
    const lastUserMessage = userMessages[userMessages.length - 1];

    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify({
        model: request.model,
        message: lastUserMessage?.content || '',
        preamble: systemMessage?.content,
        temperature: request.temperature ?? 0.7,
        max_tokens: request.maxTokens ?? 1000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Cohere API 오류 (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    const latency = Date.now() - startTime;

    const content = data.text || '';
    const inputTokens = data.meta?.tokens?.input_tokens || 0;
    const outputTokens = data.meta?.tokens?.output_tokens || 0;

    return {
      content,
      usage: {
        promptTokens: inputTokens,
        completionTokens: outputTokens,
        totalTokens: inputTokens + outputTokens,
      },
      model: request.model,
      latency,
      cost: this.computeCost(request.model, inputTokens, outputTokens),
    };
  }
}
