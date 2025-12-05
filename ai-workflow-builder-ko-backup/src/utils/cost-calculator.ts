/**
 * AI 모델 비용 계산기
 * 
 * 다양한 AI 모델의 토큰 기반 비용을 계산합니다.
 * 가격 데이터는 공식 제공자 문서에서 직접 가져왔습니다.
 * 
 * @author AI 워크플로우 빌더 팀
 * @license MIT
 */

import { LLMModel, LLMProvider } from '@/types/workflow';

// ============================================
// 타입
// ============================================

export interface ModelPricing {
  inputCostPer1K: number;
  outputCostPer1K: number;
}

export interface CostBreakdown {
  inputCost: number;
  outputCost: number;
  totalCost: number;
}

export interface UIModelInfo {
  name: string;
  description: string;
  maxTokens: number;
  cost: {
    promptTokenCost: number;
    completionTokenCost: number;
  };
}

// ============================================
// 가격 데이터 (2025년 12월 기준)
// ============================================

const PRICING_TABLE: Record<LLMModel, ModelPricing> = {
  // ===== OpenAI =====
  'gpt-4o': { inputCostPer1K: 0.0025, outputCostPer1K: 0.01 },
  'gpt-4o-mini': { inputCostPer1K: 0.00015, outputCostPer1K: 0.0006 },
  'gpt-4-turbo': { inputCostPer1K: 0.01, outputCostPer1K: 0.03 },
  'o1-preview': { inputCostPer1K: 0.015, outputCostPer1K: 0.06 },
  'o1-mini': { inputCostPer1K: 0.003, outputCostPer1K: 0.012 },

  // ===== Anthropic (Claude) =====
  'claude-3-5-sonnet-20241022': { inputCostPer1K: 0.003, outputCostPer1K: 0.015 },
  'claude-3-5-haiku-20241022': { inputCostPer1K: 0.0008, outputCostPer1K: 0.004 },
  'claude-3-opus-20240229': { inputCostPer1K: 0.015, outputCostPer1K: 0.075 },

  // ===== Google Gemini =====
  'gemini-2.0-flash': { inputCostPer1K: 0.0001, outputCostPer1K: 0.0004 },
  'gemini-1.5-flash': { inputCostPer1K: 0.000075, outputCostPer1K: 0.0003 },
  'gemini-1.5-pro': { inputCostPer1K: 0.00125, outputCostPer1K: 0.005 },

  // ===== Groq (무료!) =====
  'meta-llama/llama-4-maverick-17b-128e-instruct': { inputCostPer1K: 0, outputCostPer1K: 0 },
  'openai/gpt-oss-120b': { inputCostPer1K: 0, outputCostPer1K: 0 },
  'qwen/qwen3-32b': { inputCostPer1K: 0, outputCostPer1K: 0 },
  'llama-3.1-8b-instant': { inputCostPer1K: 0, outputCostPer1K: 0 },
  'llama-3.1-70b-versatile': { inputCostPer1K: 0, outputCostPer1K: 0 },
  'llama-3.3-70b-versatile': { inputCostPer1K: 0, outputCostPer1K: 0 },
  'mixtral-8x7b-32768': { inputCostPer1K: 0, outputCostPer1K: 0 },
  'gemma2-9b-it': { inputCostPer1K: 0, outputCostPer1K: 0 },
  'moonshotai/kimi-k2-instruct': { inputCostPer1K: 0, outputCostPer1K: 0 },

  // ===== DeepSeek (초저렴!) =====
  'deepseek-chat': { inputCostPer1K: 0.00014, outputCostPer1K: 0.00028 },
  'deepseek-coder': { inputCostPer1K: 0.00014, outputCostPer1K: 0.00028 },
  'deepseek-reasoner': { inputCostPer1K: 0.00055, outputCostPer1K: 0.00219 },

  // ===== xAI (Grok) =====
  'grok-beta': { inputCostPer1K: 0.005, outputCostPer1K: 0.015 },
  'grok-2': { inputCostPer1K: 0.002, outputCostPer1K: 0.01 },
  'grok-2-mini': { inputCostPer1K: 0.0002, outputCostPer1K: 0.001 },

  // ===== Perplexity =====
  'sonar-pro': { inputCostPer1K: 0.003, outputCostPer1K: 0.015 },
  'sonar': { inputCostPer1K: 0.001, outputCostPer1K: 0.001 },
  'sonar-reasoning': { inputCostPer1K: 0.001, outputCostPer1K: 0.005 },

  // ===== Mistral =====
  'mistral-large-latest': { inputCostPer1K: 0.002, outputCostPer1K: 0.006 },
  'mistral-small-latest': { inputCostPer1K: 0.0002, outputCostPer1K: 0.0006 },
  'codestral-latest': { inputCostPer1K: 0.0003, outputCostPer1K: 0.0009 },
  'pixtral-large-latest': { inputCostPer1K: 0.002, outputCostPer1K: 0.006 },

  // ===== Cohere =====
  'command-r-plus': { inputCostPer1K: 0.0025, outputCostPer1K: 0.01 },
  'command-r': { inputCostPer1K: 0.00015, outputCostPer1K: 0.0006 },
  'command-light': { inputCostPer1K: 0.0003, outputCostPer1K: 0.0006 },

  // ===== Moonshot (Kimi) =====
  'moonshot-v1-128k': { inputCostPer1K: 0.00077, outputCostPer1K: 0.00077 },
  'moonshot-v1-32k': { inputCostPer1K: 0.00034, outputCostPer1K: 0.00034 },
  'moonshot-v1-8k': { inputCostPer1K: 0.00017, outputCostPer1K: 0.00017 },
};

// ============================================
// 모델 정보 (UI용)
// ============================================

export const MODEL_INFO: Record<LLMModel, UIModelInfo> = {
  // ===== OpenAI =====
  'gpt-4o': {
    name: 'GPT-4o',
    description: '가장 강력한 OpenAI 모델, 멀티모달 지원',
    maxTokens: 16384,
    cost: { promptTokenCost: 0.0025, completionTokenCost: 0.01 },
  },
  'gpt-4o-mini': {
    name: 'GPT-4o Mini',
    description: '빠르고 저렴한 GPT-4급 모델',
    maxTokens: 16384,
    cost: { promptTokenCost: 0.00015, completionTokenCost: 0.0006 },
  },
  'gpt-4-turbo': {
    name: 'GPT-4 Turbo',
    description: '128K 컨텍스트, 비전 지원',
    maxTokens: 4096,
    cost: { promptTokenCost: 0.01, completionTokenCost: 0.03 },
  },
  'o1-preview': {
    name: 'o1 Preview',
    description: '추론 특화 모델, 복잡한 문제 해결',
    maxTokens: 32768,
    cost: { promptTokenCost: 0.015, completionTokenCost: 0.06 },
  },
  'o1-mini': {
    name: 'o1 Mini',
    description: '빠른 추론 모델, 코딩/수학 특화',
    maxTokens: 65536,
    cost: { promptTokenCost: 0.003, completionTokenCost: 0.012 },
  },

  // ===== Anthropic (Claude) =====
  'claude-3-5-sonnet-20241022': {
    name: 'Claude 3.5 Sonnet',
    description: '최신 Claude, 코딩/분석 최강',
    maxTokens: 8192,
    cost: { promptTokenCost: 0.003, completionTokenCost: 0.015 },
  },
  'claude-3-5-haiku-20241022': {
    name: 'Claude 3.5 Haiku',
    description: '빠르고 저렴한 Claude',
    maxTokens: 8192,
    cost: { promptTokenCost: 0.0008, completionTokenCost: 0.004 },
  },
  'claude-3-opus-20240229': {
    name: 'Claude 3 Opus',
    description: '가장 강력한 Claude, 복잡한 작업용',
    maxTokens: 4096,
    cost: { promptTokenCost: 0.015, completionTokenCost: 0.075 },
  },

  // ===== Google Gemini =====
  'gemini-2.0-flash': {
    name: 'Gemini 2.0 Flash',
    description: '최신 Gemini, 빠르고 효율적',
    maxTokens: 8192,
    cost: { promptTokenCost: 0.0001, completionTokenCost: 0.0004 },
  },
  'gemini-1.5-flash': {
    name: 'Gemini 1.5 Flash',
    description: '1M 토큰 컨텍스트, 초저렴',
    maxTokens: 8192,
    cost: { promptTokenCost: 0.000075, completionTokenCost: 0.0003 },
  },
  'gemini-1.5-pro': {
    name: 'Gemini 1.5 Pro',
    description: '1M 토큰 컨텍스트, 고성능',
    maxTokens: 8192,
    cost: { promptTokenCost: 0.00125, completionTokenCost: 0.005 },
  },

  // ===== Groq (무료!) =====
  'meta-llama/llama-4-maverick-17b-128e-instruct': {
    name: 'Llama 4 Maverick 🔥',
    description: '🆓 무료! 최신 Llama 4, 128K 컨텍스트',
    maxTokens: 8192,
    cost: { promptTokenCost: 0, completionTokenCost: 0 },
  },
  'openai/gpt-oss-120b': {
    name: 'GPT-OSS 120B',
    description: '🆓 무료! 120B 초대형 모델',
    maxTokens: 8192,
    cost: { promptTokenCost: 0, completionTokenCost: 0 },
  },
  'qwen/qwen3-32b': {
    name: 'Qwen3 32B',
    description: '🆓 무료! 알리바바 최신 모델',
    maxTokens: 8192,
    cost: { promptTokenCost: 0, completionTokenCost: 0 },
  },
  'llama-3.1-8b-instant': {
    name: 'Llama 3.1 8B',
    description: '🆓 무료! 초고속 응답',
    maxTokens: 8192,
    cost: { promptTokenCost: 0, completionTokenCost: 0 },
  },
  'llama-3.1-70b-versatile': {
    name: 'Llama 3.1 70B',
    description: '🆓 무료! 강력한 70B 모델',
    maxTokens: 8192,
    cost: { promptTokenCost: 0, completionTokenCost: 0 },
  },
  'llama-3.3-70b-versatile': {
    name: 'Llama 3.3 70B',
    description: '🆓 무료! 최신 70B 모델',
    maxTokens: 8192,
    cost: { promptTokenCost: 0, completionTokenCost: 0 },
  },
  'mixtral-8x7b-32768': {
    name: 'Mixtral 8x7B',
    description: '🆓 무료! MoE 아키텍처, 32K 컨텍스트',
    maxTokens: 32768,
    cost: { promptTokenCost: 0, completionTokenCost: 0 },
  },
  'gemma2-9b-it': {
    name: 'Gemma 2 9B',
    description: '🆓 무료! Google 오픈소스 모델',
    maxTokens: 8192,
    cost: { promptTokenCost: 0, completionTokenCost: 0 },
  },
  'moonshotai/kimi-k2-instruct': {
    name: 'Kimi K2',
    description: '🆓 무료! Moonshot AI 최신',
    maxTokens: 8192,
    cost: { promptTokenCost: 0, completionTokenCost: 0 },
  },

  // ===== DeepSeek (초저렴!) =====
  'deepseek-chat': {
    name: 'DeepSeek Chat',
    description: '💰 초저렴! GPT-4급 성능',
    maxTokens: 8192,
    cost: { promptTokenCost: 0.00014, completionTokenCost: 0.00028 },
  },
  'deepseek-coder': {
    name: 'DeepSeek Coder',
    description: '💰 초저렴! 코딩 특화 모델',
    maxTokens: 8192,
    cost: { promptTokenCost: 0.00014, completionTokenCost: 0.00028 },
  },
  'deepseek-reasoner': {
    name: 'DeepSeek R1',
    description: '💰 저렴한 추론 모델 (o1 대체)',
    maxTokens: 8192,
    cost: { promptTokenCost: 0.00055, completionTokenCost: 0.00219 },
  },

  // ===== xAI (Grok) =====
  'grok-beta': {
    name: 'Grok Beta',
    description: '일론 머스크의 AI, 실시간 정보',
    maxTokens: 8192,
    cost: { promptTokenCost: 0.005, completionTokenCost: 0.015 },
  },
  'grok-2': {
    name: 'Grok 2',
    description: '최신 Grok, 강력한 추론 능력',
    maxTokens: 8192,
    cost: { promptTokenCost: 0.002, completionTokenCost: 0.01 },
  },
  'grok-2-mini': {
    name: 'Grok 2 Mini',
    description: '빠르고 효율적인 Grok',
    maxTokens: 8192,
    cost: { promptTokenCost: 0.0002, completionTokenCost: 0.001 },
  },

  // ===== Perplexity =====
  'sonar-pro': {
    name: 'Sonar Pro',
    description: '🔍 검색 특화! 최신 정보 탐색',
    maxTokens: 8192,
    cost: { promptTokenCost: 0.003, completionTokenCost: 0.015 },
  },
  'sonar': {
    name: 'Sonar',
    description: '🔍 검색 특화! 빠른 정보 탐색',
    maxTokens: 8192,
    cost: { promptTokenCost: 0.001, completionTokenCost: 0.001 },
  },
  'sonar-reasoning': {
    name: 'Sonar Reasoning',
    description: '🔍 검색 + 추론 결합',
    maxTokens: 8192,
    cost: { promptTokenCost: 0.001, completionTokenCost: 0.005 },
  },

  // ===== Mistral =====
  'mistral-large-latest': {
    name: 'Mistral Large',
    description: '유럽 최강 AI, 다국어 지원',
    maxTokens: 8192,
    cost: { promptTokenCost: 0.002, completionTokenCost: 0.006 },
  },
  'mistral-small-latest': {
    name: 'Mistral Small',
    description: '빠르고 효율적인 Mistral',
    maxTokens: 8192,
    cost: { promptTokenCost: 0.0002, completionTokenCost: 0.0006 },
  },
  'codestral-latest': {
    name: 'Codestral',
    description: '코딩 특화 Mistral 모델',
    maxTokens: 8192,
    cost: { promptTokenCost: 0.0003, completionTokenCost: 0.0009 },
  },
  'pixtral-large-latest': {
    name: 'Pixtral Large',
    description: '멀티모달 Mistral, 이미지 이해',
    maxTokens: 8192,
    cost: { promptTokenCost: 0.002, completionTokenCost: 0.006 },
  },

  // ===== Cohere =====
  'command-r-plus': {
    name: 'Command R+',
    description: 'RAG 특화, 검색 증강 생성',
    maxTokens: 4096,
    cost: { promptTokenCost: 0.0025, completionTokenCost: 0.01 },
  },
  'command-r': {
    name: 'Command R',
    description: '균형 잡힌 Cohere 모델',
    maxTokens: 4096,
    cost: { promptTokenCost: 0.00015, completionTokenCost: 0.0006 },
  },
  'command-light': {
    name: 'Command Light',
    description: '빠르고 가벼운 Cohere 모델',
    maxTokens: 4096,
    cost: { promptTokenCost: 0.0003, completionTokenCost: 0.0006 },
  },

  // ===== Moonshot (Kimi) =====
  'moonshot-v1-128k': {
    name: 'Kimi 128K',
    description: '🇨🇳 중국 AI, 128K 초장문 컨텍스트',
    maxTokens: 8192,
    cost: { promptTokenCost: 0.00077, completionTokenCost: 0.00077 },
  },
  'moonshot-v1-32k': {
    name: 'Kimi 32K',
    description: '🇨🇳 중국 AI, 32K 장문 컨텍스트',
    maxTokens: 8192,
    cost: { promptTokenCost: 0.00034, completionTokenCost: 0.00034 },
  },
  'moonshot-v1-8k': {
    name: 'Kimi 8K',
    description: '🇨🇳 중국 AI, 빠른 응답',
    maxTokens: 8192,
    cost: { promptTokenCost: 0.00017, completionTokenCost: 0.00017 },
  },
};

// ============================================
// 제공자별 모델 매핑
// ============================================

export const MODELS_BY_PROVIDER: Record<LLMProvider, LLMModel[]> = {
  openai: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'o1-preview', 'o1-mini'],
  anthropic: ['claude-3-5-sonnet-20241022', 'claude-3-5-haiku-20241022', 'claude-3-opus-20240229'],
  gemini: ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-pro'],
  groq: ['meta-llama/llama-4-maverick-17b-128e-instruct', 'openai/gpt-oss-120b', 'qwen/qwen3-32b', 'llama-3.1-8b-instant', 'moonshotai/kimi-k2-instruct'],
  deepseek: ['deepseek-chat', 'deepseek-coder', 'deepseek-reasoner'],
  xai: ['grok-2', 'grok-2-mini', 'grok-beta'],
  perplexity: ['sonar-pro', 'sonar', 'sonar-reasoning'],
  mistral: ['mistral-large-latest', 'mistral-small-latest', 'codestral-latest', 'pixtral-large-latest'],
  cohere: ['command-r-plus', 'command-r', 'command-light'],
  moonshot: ['moonshot-v1-128k', 'moonshot-v1-32k', 'moonshot-v1-8k'],
};

// ============================================
// 제공자 정보 (UI용)
// ============================================

export const PROVIDER_INFO: Record<LLMProvider, { name: string; color: string; description: string }> = {
  openai: { name: 'OpenAI', color: 'bg-emerald-600', description: 'GPT 시리즈' },
  anthropic: { name: 'Anthropic', color: 'bg-orange-500', description: 'Claude 시리즈' },
  gemini: { name: 'Google', color: 'bg-blue-500', description: 'Gemini 시리즈' },
  groq: { name: 'Groq', color: 'bg-red-500', description: '🆓 무료! 초고속' },
  deepseek: { name: 'DeepSeek', color: 'bg-purple-600', description: '💰 초저렴!' },
  xai: { name: 'xAI', color: 'bg-gray-800', description: 'Grok 시리즈' },
  perplexity: { name: 'Perplexity', color: 'bg-teal-500', description: '🔍 검색 특화' },
  mistral: { name: 'Mistral', color: 'bg-indigo-500', description: '유럽 AI' },
  cohere: { name: 'Cohere', color: 'bg-pink-500', description: 'RAG 특화' },
  moonshot: { name: 'Moonshot', color: 'bg-yellow-600', description: '🇨🇳 Kimi' },
};

// ============================================
// 비용 계산 함수
// ============================================

export function calculateTokenCost(
  model: LLMModel,
  inputTokens: number,
  outputTokens: number
): CostBreakdown {
  const pricing = PRICING_TABLE[model];
  if (!pricing) return { inputCost: 0, outputCost: 0, totalCost: 0 };

  const inputCost = (inputTokens / 1000) * pricing.inputCostPer1K;
  const outputCost = (outputTokens / 1000) * pricing.outputCostPer1K;

  return { inputCost, outputCost, totalCost: inputCost + outputCost };
}

export function isModelFree(model: LLMModel): boolean {
  const pricing = PRICING_TABLE[model];
  return pricing?.inputCostPer1K === 0 && pricing?.outputCostPer1K === 0;
}

export function formatCost(costUSD: number): string {
  if (costUSD === 0) return '무료';
  if (costUSD < 0.0001) return `$${costUSD.toFixed(6)}`;
  if (costUSD < 0.01) return `$${costUSD.toFixed(4)}`;
  return `$${costUSD.toFixed(2)}`;
}

// 레거시 export
export const PROVIDER_MODELS = MODELS_BY_PROVIDER;
export { calculateTokenCost as calculateCost };
