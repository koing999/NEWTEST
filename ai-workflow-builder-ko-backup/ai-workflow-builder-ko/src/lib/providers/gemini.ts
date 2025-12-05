/**
 * Google Gemini Provider
 * 
 * Integrates with Google's Generative AI API (Gemini models).
 * Free tier: 15 requests/minute, 1500 requests/day
 * 
 * API Documentation: https://ai.google.dev/gemini-api/docs
 * 
 * @author AI Workflow Builder Team
 * @license MIT
 */

import { LLMRequest, LLMResponse } from '@/types/workflow';
import { LLMProviderBase, ProviderConfig } from './base';

const API_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta';

/**
 * Gemini API request format
 */
interface GeminiRequestBody {
  contents: Array<{
    role: string;
    parts: Array<{ text: string }>;
  }>;
  systemInstruction?: {
    parts: Array<{ text: string }>;
  };
  generationConfig?: {
    temperature?: number;
    maxOutputTokens?: number;
  };
}

/**
 * Gemini API response format
 */
interface GeminiAPIResponse {
  candidates: Array<{
    content: {
      parts: Array<{ text: string }>;
      role: string;
    };
    finishReason: string;
  }>;
  usageMetadata: {
    promptTokenCount: number;
    candidatesTokenCount: number;
    totalTokenCount: number;
  };
}

/**
 * Google Gemini Provider Implementation
 */
export class GeminiProvider extends LLMProviderBase {
  constructor(apiKey: string) {
    super({ apiKey });
  }

  async call(request: LLMRequest): Promise<LLMResponse> {
    const startTime = Date.now();

    // Build request body
    const requestBody = this.buildRequestBody(request);
    
    // Make API call
    const url = `${API_ENDPOINT}/models/${request.model}:generateContent?key=${this.config.apiKey}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API error (${response.status}): ${errorText}`);
    }

    const data: GeminiAPIResponse = await response.json();
    const latency = Date.now() - startTime;

    // Extract response
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const inputTokens = data.usageMetadata?.promptTokenCount || 0;
    const outputTokens = data.usageMetadata?.candidatesTokenCount || 0;

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

  private buildRequestBody(request: LLMRequest): GeminiRequestBody {
    const contents: GeminiRequestBody['contents'] = [];
    let systemInstruction: GeminiRequestBody['systemInstruction'];

    for (const msg of request.messages) {
      if (msg.role === 'system') {
        systemInstruction = { parts: [{ text: msg.content }] };
      } else {
        contents.push({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }],
        });
      }
    }

    const body: GeminiRequestBody = {
      contents,
      generationConfig: {
        temperature: request.temperature ?? 0.7,
        maxOutputTokens: request.maxTokens ?? 1000,
      },
    };

    if (systemInstruction) {
      body.systemInstruction = systemInstruction;
    }

    return body;
  }
}

/**
 * Factory function to create a Gemini provider
 */
export function createGeminiProvider(apiKey: string): GeminiProvider {
  return new GeminiProvider(apiKey);
}
