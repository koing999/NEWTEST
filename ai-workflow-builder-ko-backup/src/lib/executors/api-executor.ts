/**
 * API 노드 실행기 (Refactored)
 * Handler Pattern을 사용하여 모듈화됨
 */

import { ApiNodeData } from '@/types/workflow';
import { handlers } from './handlers';
import { ApiError } from './errors/ApiError';

export async function executeApiCall(
  data: ApiNodeData,
  input: string
): Promise<{ output: string; statusCode?: number }> {
  const preset = data.preset || 'custom';
  const handler = handlers[preset];

  if (!handler) {
    throw new ApiError(`지원하지 않는 API 프리셋입니다: ${preset}`, 'UNKNOWN_PRESET');
  }

  try {
    // 🧠 통역사 노드 데이터 처리 (공통 로직)
    let effectiveInput = input.trim();
    try {
      const parsed = JSON.parse(input);
      if (parsed.__intentparser__) {
        effectiveInput = parsed.company || parsed.stockCode || parsed.ticker || parsed.keyword || parsed.city || input;
        console.log(`[API] 통역사 데이터 감지: ${effectiveInput}`);
      }
    } catch { }

    const result = await handler.execute(data, effectiveInput);
    return {
      output: result.output,
      statusCode: result.statusCode
    };
  } catch (error) {
    const apiError = ApiError.from(error);
    console.error(`[API Executor] Error:`, apiError);
    throw apiError;
  }
}
