/**
 * 공통 유틸리티 모듈
 * 
 * 프로젝트 전반에서 사용되는 유틸리티 함수들을 통합 관리합니다.
 * 
 * @author AI 워크플로우 빌더 팀
 */

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// ============================================
// CSS 클래스 유틸리티
// ============================================

/**
 * Tailwind CSS 클래스 병합
 * clsx + tailwind-merge 조합으로 중복 클래스 처리
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// ============================================
// ID 생성 유틸리티
// ============================================

/**
 * 안전한 고유 ID 생성기
 * crypto.randomUUID를 사용하여 충돌 없는 ID 생성
 */
export function createSafeId(prefix: string = ''): string {
  const uuid = typeof crypto !== 'undefined' && crypto.randomUUID 
    ? crypto.randomUUID() 
    : `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
  return prefix ? `${prefix}-${uuid}` : uuid;
}

/**
 * 노드용 ID 생성
 */
export function createNodeId(type: string): string {
  return createSafeId(type);
}

/**
 * 워크플로우용 ID 생성
 */
export function createWorkflowId(): string {
  return createSafeId('workflow');
}

/**
 * 실행 결과용 ID 생성
 */
export function createExecutionId(): string {
  return createSafeId('exec');
}

// ============================================
// 문자열 유틸리티
// ============================================

/**
 * 문자열 자르기 (말줄임 포함)
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 3) + '...';
}

/**
 * HTML 태그 제거
 */
export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '');
}

/**
 * HTML 엔티티 디코딩
 */
export function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&apos;/gi, "'");
}

// ============================================
// JSON 유틸리티
// ============================================

/**
 * 안전한 JSON 파싱
 */
export function safeJsonParse<T>(str: string, fallback: T): T {
  try {
    return JSON.parse(str) as T;
  } catch {
    return fallback;
  }
}

/**
 * JSON 문자열인지 확인
 */
export function isJsonString(str: string): boolean {
  try {
    JSON.parse(str);
    return true;
  } catch {
    return false;
  }
}

/**
 * 예쁘게 JSON 포맷팅
 */
export function prettyJson(obj: unknown): string {
  return JSON.stringify(obj, null, 2);
}

// ============================================
// 숫자 유틸리티
// ============================================

/**
 * 숫자 범위 제한
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * 한국식 숫자 포맷 (억, 조 단위)
 */
export function formatKoreanNumber(value: number): string {
  if (Math.abs(value) >= 1e12) {
    return `${(value / 1e12).toFixed(1)}조`;
  } else if (Math.abs(value) >= 1e8) {
    return `${(value / 1e8).toFixed(1)}억`;
  } else if (Math.abs(value) >= 1e4) {
    return `${(value / 1e4).toFixed(1)}만`;
  }
  return value.toLocaleString('ko-KR');
}

/**
 * 퍼센트 포맷
 */
export function formatPercent(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

// ============================================
// 날짜 유틸리티
// ============================================

/**
 * 한국 시간대 포맷
 */
export function formatKoreanDateTime(date: Date = new Date()): string {
  return date.toLocaleString('ko-KR', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
}

/**
 * ISO 날짜 문자열 (날짜만)
 */
export function toISODateString(date: Date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

// ============================================
// 배열 유틸리티
// ============================================

/**
 * 배열에서 랜덤 선택
 */
export function randomPick<T>(arr: T[], count: number = 1, allowDuplicate: boolean = false): T[] {
  if (arr.length === 0) return [];
  
  const safeCount = Math.min(count, allowDuplicate ? count : arr.length);
  const results: T[] = [];
  
  if (allowDuplicate) {
    for (let i = 0; i < safeCount; i++) {
      results.push(arr[Math.floor(Math.random() * arr.length)]);
    }
  } else {
    const shuffled = [...arr].sort(() => Math.random() - 0.5);
    results.push(...shuffled.slice(0, safeCount));
  }
  
  return results;
}

/**
 * 배열 청킹
 */
export function chunk<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

/**
 * 고유 값 추출
 */
export function unique<T>(arr: T[]): T[] {
  return [...new Set(arr)];
}

// ============================================
// 비동기 유틸리티
// ============================================

/**
 * 지연 실행
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 타임아웃 래퍼
 */
export async function withTimeout<T>(
  promise: Promise<T>, 
  ms: number, 
  errorMessage: string = '작업 시간이 초과되었습니다.'
): Promise<T> {
  const timeout = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error(errorMessage)), ms);
  });
  return Promise.race([promise, timeout]);
}

/**
 * 재시도 래퍼
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T> {
  let lastError: Error | null = null;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      if (i < maxRetries - 1) {
        await delay(delayMs * (i + 1)); // 점진적 지연
      }
    }
  }
  
  throw lastError;
}

// ============================================
// 타입 가드 유틸리티
// ============================================

/**
 * 객체인지 확인
 */
export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * 빈 값 확인
 */
export function isEmpty(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  if (isObject(value)) return Object.keys(value).length === 0;
  return false;
}

/**
 * 숫자인지 확인 (문자열 포함)
 */
export function isNumeric(value: unknown): boolean {
  if (typeof value === 'number') return !isNaN(value);
  if (typeof value === 'string') return !isNaN(parseFloat(value));
  return false;
}

// ============================================
// 에러 유틸리티
// ============================================

/**
 * 에러 메시지 추출
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return '알 수 없는 오류가 발생했습니다.';
}

/**
 * 안전한 에러 래퍼
 */
export function tryCatch<T>(fn: () => T, fallback: T): T {
  try {
    return fn();
  } catch {
    return fallback;
  }
}

// ============================================
// 환경 유틸리티
// ============================================

/**
 * 클라이언트 환경인지 확인
 */
export function isClient(): boolean {
  return typeof window !== 'undefined';
}

/**
 * 서버 환경인지 확인
 */
export function isServer(): boolean {
  return typeof window === 'undefined';
}

// ============================================
// 내보내기
// ============================================

export default {
  cn,
  createSafeId,
  createNodeId,
  createWorkflowId,
  createExecutionId,
  truncate,
  stripHtml,
  decodeHtmlEntities,
  safeJsonParse,
  isJsonString,
  prettyJson,
  clamp,
  formatKoreanNumber,
  formatPercent,
  formatKoreanDateTime,
  toISODateString,
  randomPick,
  chunk,
  unique,
  delay,
  withTimeout,
  withRetry,
  isObject,
  isEmpty,
  isNumeric,
  getErrorMessage,
  tryCatch,
  isClient,
  isServer,
};
