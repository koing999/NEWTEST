/**
 * OpenAI Provider
 * 
 * Integrates with OpenAI's Chat Completions API.
 * Paid API - requires valid API key with credits.
 * 
 * API Documentation: https://platform.openai.com/docs
 * 
 * @author AI Workflow Builder Team
 * @license MIT
 */

import { LLMRequest, LLMResponse } from '@/types/workflow';
import { LLMProviderBase } from './base';

const API_ENDPOINT = 'https://api.openai.com/v1/chat/completions';

/**
 * OpenAI Chat Completions request format
 */
interface OpenAIRequestBody {
  model: string;
  messages: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
  }>;
  temperature?: number;
  max_tokens?: number;
}

interface OpenAIAPIResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * OpenAI Provider Implementation
 */
export class OpenAIProvider extends LLMProviderBase {
  constructor(apiKey: string) {
    super({ apiKey });
  }

  async call(request: LLMRequest): Promise<LLMResponse> {
    const startTime = Date.now();

    const requestBody: OpenAIRequestBody = {
      model: request.model,
      messages: request.messages.map(m => ({
        role: m.role,
        content: m.content,
      })),
      temperature: request.temperature ?? 0.7,
      max_tokens: request.maxTokens ?? 1000,
    };

    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI API error (${response.status}): ${errorText}`);
    }

    const data: OpenAIAPIResponse = await response.json();
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

/**
 * Factory function to create an OpenAI provider
 */
export function createOpenAIProvider(apiKey: string): OpenAIProvider {
  return new OpenAIProvider(apiKey);
}
