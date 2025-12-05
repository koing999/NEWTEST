/**
 * DeepSeek 프로바이더
 * 
 * DeepSeek 모델과 통합합니다. (OpenAI 호환 API)
 * 
 * @author AI 워크플로우 빌더 팀
 * @license MIT
 */

import { LLMRequest, LLMResponse } from '@/types/workflow';
import { LLMProviderBase } from './base';

const API_ENDPOINT = 'https://api.deepseek.com/v1/chat/completions';

export class DeepSeekProvider extends LLMProviderBase {
  constructor(apiKey: string) {
    super({ apiKey });
  }

  async call(request: LLMRequest): Promise<LLMResponse> {
    const startTime = Date.now();

    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify({
        model: request.model,
        messages: request.messages.map(m => ({
          role: m.role,
          content: m.content,
        })),
        temperature: request.temperature ?? 0.7,
        max_tokens: request.maxTokens ?? 1000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`DeepSeek API 오류 (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    const latency = Date.now() - startTime;

    const content = data.choices?.[0]?.message?.content || '';
    const inputTokens = data.usage?.prompt_tokens || 0;
    const outputTokens = data.usage?.completion_tokens || 0;

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
