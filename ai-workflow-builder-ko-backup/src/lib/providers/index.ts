/**
 * LLM 프로바이더 팩토리
 * 
 * LLM 프로바이더 인스턴스를 생성하고 관리합니다.
 * 다양한 AI 제공자를 위한 통합 인터페이스를 제공합니다.
 * 
 * @author AI 워크플로우 빌더 팀
 * @license MIT
 */

import { LLMProvider, LLMRequest, LLMResponse } from '@/types/workflow';
import { GeminiProvider } from './gemini';
import { GroqProvider } from './groq';
import { OpenAIProvider } from './openai';
import { AnthropicProvider } from './anthropic';
import { DeepSeekProvider } from './deepseek';
import { XAIProvider } from './xai';
import { PerplexityProvider } from './perplexity';
import { MistralProvider } from './mistral';
import { CohereProvider } from './cohere';
import { MoonshotProvider } from './moonshot';

// 유틸리티 re-export
export { createMessageArray as buildMessages } from './base';

/**
 * 각 프로바이더의 환경 변수 이름
 */
const ENV_KEYS: Record<LLMProvider, string[]> = {
  openai: ['OPENAI_API_KEY'],
  anthropic: ['ANTHROPIC_API_KEY'],
  gemini: ['GOOGLE_GENERATIVE_AI_API_KEY', 'GEMINI_API_KEY'],
  groq: ['GROQ_API_KEY'],
  deepseek: ['DEEPSEEK_API_KEY'],
  xai: ['XAI_API_KEY'],
  perplexity: ['PERPLEXITY_API_KEY', 'PPLX_API_KEY'],
  mistral: ['MISTRAL_API_KEY'],
  cohere: ['COHERE_API_KEY', 'CO_API_KEY'],
  moonshot: ['MOONSHOT_API_KEY', 'KIMI_API_KEY'],
};

/**
 * 프로바이더의 API 키 조회
 */
export function getProviderApiKey(provider: LLMProvider): string | null {
  const envKeys = ENV_KEYS[provider];
  
  for (const key of envKeys) {
    const value = process.env[key];
    if (value && value.trim()) {
      return value.trim();
    }
  }
  
  return null;
}

/**
 * 프로바이더가 설정되었는지 확인
 */
export function isProviderConfigured(provider: LLMProvider): boolean {
  return getProviderApiKey(provider) !== null;
}

/**
 * 설정된 모든 프로바이더 조회
 */
export function getConfiguredProviders(): LLMProvider[] {
  const allProviders: LLMProvider[] = [
    'openai', 'anthropic', 'gemini', 'groq', 'deepseek',
    'xai', 'perplexity', 'mistral', 'cohere', 'moonshot'
  ];
  return allProviders.filter(isProviderConfigured);
}

/**
 * 프로바이더 인스턴스 생성
 */
function createProvider(provider: LLMProvider, apiKey: string) {
  switch (provider) {
    case 'openai':
      return new OpenAIProvider(apiKey);
    case 'anthropic':
      return new AnthropicProvider(apiKey);
    case 'gemini':
      return new GeminiProvider(apiKey);
    case 'groq':
      return new GroqProvider(apiKey);
    case 'deepseek':
      return new DeepSeekProvider(apiKey);
    case 'xai':
      return new XAIProvider(apiKey);
    case 'perplexity':
      return new PerplexityProvider(apiKey);
    case 'mistral':
      return new MistralProvider(apiKey);
    case 'cohere':
      return new CohereProvider(apiKey);
    case 'moonshot':
      return new MoonshotProvider(apiKey);
    default:
      throw new Error(`알 수 없는 프로바이더: ${provider}`);
  }
}

/**
 * 재시도 대기 (지수 백오프)
 */
async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * LLM 호출 (에러 재시도 포함)
 * 환경 변수에서 자동으로 API 키를 조회합니다
 * @param request LLM 요청
 * @param maxRetries 최대 재시도 횟수 (기본 3)
 * @param baseDelayMs 기본 대기 시간 밀리초 (기본 1000)
 */
export async function callLLM(
  request: LLMRequest, 
  maxRetries: number = 3,
  baseDelayMs: number = 1000
): Promise<LLMResponse> {
  const apiKey = getProviderApiKey(request.provider);
  
  if (!apiKey) {
    const envVars = ENV_KEYS[request.provider].join(' 또는 ');
    throw new Error(
      `${request.provider}의 API 키가 설정되지 않았습니다. ` +
      `환경 변수에 ${envVars}를 설정해주세요.`
    );
  }

  const provider = createProvider(request.provider, apiKey);
  
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await provider.call(request);
      return response;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      // 마지막 시도면 에러 throw
      if (attempt === maxRetries) {
        break;
      }
      
      // 재시도 불가능한 에러인지 확인
      const errorMessage = lastError.message.toLowerCase();
      const isRetryable = 
        errorMessage.includes('rate limit') ||
        errorMessage.includes('timeout') ||
        errorMessage.includes('503') ||
        errorMessage.includes('502') ||
        errorMessage.includes('500') ||
        errorMessage.includes('network') ||
        errorMessage.includes('econnreset') ||
        errorMessage.includes('temporarily');
      
      if (!isRetryable) {
        // API 키 오류, 권한 오류 등은 재시도 불가
        break;
      }
      
      // 지수 백오프: 1초, 2초, 4초...
      const delayMs = baseDelayMs * Math.pow(2, attempt);
      console.log(`[조과장] 재시도 ${attempt + 1}/${maxRetries}: ${delayMs}ms 후 다시 시도...`);
      await sleep(delayMs);
    }
  }
  
  throw lastError || new Error('LLM 호출 실패');
}

/**
 * UI 표시용 프로바이더 메타데이터
 */
export const PROVIDER_METADATA: Record<LLMProvider, {
  name: string;
  description: string;
  envVarName: string;
  docsUrl: string;
  isFreeAvailable: boolean;
}> = {
  openai: {
    name: 'OpenAI',
    description: 'GPT-4o, o1 시리즈',
    envVarName: 'OPENAI_API_KEY',
    docsUrl: 'https://platform.openai.com/docs',
    isFreeAvailable: false,
  },
  anthropic: {
    name: 'Anthropic',
    description: 'Claude 3.5 시리즈',
    envVarName: 'ANTHROPIC_API_KEY',
    docsUrl: 'https://docs.anthropic.com',
    isFreeAvailable: false,
  },
  gemini: {
    name: 'Google Gemini',
    description: 'Gemini 2.0, 1.5 시리즈',
    envVarName: 'GOOGLE_GENERATIVE_AI_API_KEY',
    docsUrl: 'https://ai.google.dev/docs',
    isFreeAvailable: true,
  },
  groq: {
    name: 'Groq',
    description: '무료! Llama, Mixtral 초고속',
    envVarName: 'GROQ_API_KEY',
    docsUrl: 'https://console.groq.com/docs',
    isFreeAvailable: true,
  },
  deepseek: {
    name: 'DeepSeek',
    description: '초저렴! GPT-4급 성능',
    envVarName: 'DEEPSEEK_API_KEY',
    docsUrl: 'https://platform.deepseek.com/docs',
    isFreeAvailable: false,
  },
  xai: {
    name: 'xAI',
    description: 'Grok 시리즈',
    envVarName: 'XAI_API_KEY',
    docsUrl: 'https://docs.x.ai',
    isFreeAvailable: false,
  },
  perplexity: {
    name: 'Perplexity',
    description: '검색 특화 AI',
    envVarName: 'PERPLEXITY_API_KEY',
    docsUrl: 'https://docs.perplexity.ai',
    isFreeAvailable: false,
  },
  mistral: {
    name: 'Mistral',
    description: '유럽 AI, 다국어 지원',
    envVarName: 'MISTRAL_API_KEY',
    docsUrl: 'https://docs.mistral.ai',
    isFreeAvailable: false,
  },
  cohere: {
    name: 'Cohere',
    description: 'RAG 특화, 검색 증강',
    envVarName: 'COHERE_API_KEY',
    docsUrl: 'https://docs.cohere.com',
    isFreeAvailable: false,
  },
  moonshot: {
    name: 'Moonshot (Kimi)',
    description: '중국 AI, 장문 컨텍스트',
    envVarName: 'MOONSHOT_API_KEY',
    docsUrl: 'https://platform.moonshot.cn/docs',
    isFreeAvailable: false,
  },
};
