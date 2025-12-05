/**
 * Base LLM Provider Interface
 * 
 * Provides a unified interface for calling different AI providers.
 * Each provider implements this interface for consistent behavior.
 * 
 * @author AI Workflow Builder Team
 * @license MIT
 */

import { LLMRequest, LLMResponse, LLMMessage, LLMModel } from '@/types/workflow';
import { calculateTokenCost } from '@/utils/cost-calculator';

export interface ProviderConfig {
  apiKey: string;
  baseUrl?: string;
}

/**
 * Abstract base class for LLM providers
 */
export abstract class LLMProviderBase {
  protected config: ProviderConfig;

  constructor(config: ProviderConfig) {
    this.config = config;
  }

  /**
   * Send a request to the LLM and get a response
   */
  abstract call(request: LLMRequest): Promise<LLMResponse>;

  /**
   * Calculate cost based on token usage
   */
  protected computeCost(
    model: string,
    inputTokens: number,
    outputTokens: number
  ): number {
    const breakdown = calculateTokenCost(model as LLMModel, inputTokens, outputTokens);
    return breakdown.totalCost;
  }
}

/**
 * Replace template variables in a string
 * Replaces {{variableName}} with actual values
 */
export function interpolateTemplate(template: string, variables: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => variables[key] || '');
}

/**
 * Simple helper to replace {{input}} with the input value
 */
export function applyInputVariable(template: string, input: string): string {
  return template.replace(/\{\{input\}\}/g, input);
}

/**
 * Build a message array from system prompt and user prompt
 */
export function createMessageArray(
  systemPrompt: string | undefined,
  userPrompt: string,
  inputValue: string
): LLMMessage[] {
  const messages: LLMMessage[] = [];
  
  if (systemPrompt && systemPrompt.trim()) {
    messages.push({
      role: 'system',
      content: applyInputVariable(systemPrompt, inputValue),
    });
  }
  
  messages.push({
    role: 'user',
    content: applyInputVariable(userPrompt, inputValue),
  });
  
  return messages;
}

// Export for backward compatibility
export { createMessageArray as buildMessages };
