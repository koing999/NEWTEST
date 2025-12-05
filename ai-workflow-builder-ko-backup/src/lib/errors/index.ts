/**
 * 에러 클래스 모듈
 * 
 * 워크플로우 실행 중 발생할 수 있는 다양한 에러 타입을 정의합니다.
 * 
 * @author AI 워크플로우 빌더 팀
 */

// ============================================
// 기본 에러 클래스
// ============================================

/**
 * 워크플로우 기본 에러
 */
export class WorkflowError extends Error {
  public readonly code: string;
  public readonly details?: Record<string, unknown>;
  public readonly timestamp: string;

  constructor(
    message: string,
    code: string = 'WORKFLOW_ERROR',
    details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'WorkflowError';
    this.code = code;
    this.details = details;
    this.timestamp = new Date().toISOString();
    
    // Error 클래스 상속 시 프로토타입 체인 유지
    Object.setPrototypeOf(this, WorkflowError.prototype);
  }

  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      details: this.details,
      timestamp: this.timestamp,
    };
  }
}

// ============================================
// 노드 관련 에러
// ============================================

/**
 * 노드 실행 에러
 */
export class NodeExecutionError extends WorkflowError {
  public readonly nodeId: string;
  public readonly nodeType?: string;

  constructor(
    message: string,
    nodeId: string,
    nodeType?: string,
    details?: Record<string, unknown>
  ) {
    super(message, 'NODE_EXECUTION_ERROR', { ...details, nodeId, nodeType });
    this.name = 'NodeExecutionError';
    this.nodeId = nodeId;
    this.nodeType = nodeType;
    
    Object.setPrototypeOf(this, NodeExecutionError.prototype);
  }
}

/**
 * 노드 설정 에러
 */
export class NodeConfigError extends WorkflowError {
  public readonly nodeId: string;
  public readonly field: string;

  constructor(
    message: string,
    nodeId: string,
    field: string,
    details?: Record<string, unknown>
  ) {
    super(message, 'NODE_CONFIG_ERROR', { ...details, nodeId, field });
    this.name = 'NodeConfigError';
    this.nodeId = nodeId;
    this.field = field;
    
    Object.setPrototypeOf(this, NodeConfigError.prototype);
  }
}

/**
 * 노드 연결 에러
 */
export class NodeConnectionError extends WorkflowError {
  public readonly sourceNodeId?: string;
  public readonly targetNodeId?: string;

  constructor(
    message: string,
    sourceNodeId?: string,
    targetNodeId?: string,
    details?: Record<string, unknown>
  ) {
    super(message, 'NODE_CONNECTION_ERROR', { ...details, sourceNodeId, targetNodeId });
    this.name = 'NodeConnectionError';
    this.sourceNodeId = sourceNodeId;
    this.targetNodeId = targetNodeId;
    
    Object.setPrototypeOf(this, NodeConnectionError.prototype);
  }
}

// ============================================
// API 관련 에러
// ============================================

/**
 * API 호출 에러
 */
export class ApiError extends WorkflowError {
  public readonly statusCode?: number;
  public readonly endpoint?: string;

  constructor(
    message: string,
    code: string = 'API_ERROR',
    statusCode?: number,
    endpoint?: string,
    details?: Record<string, unknown>
  ) {
    super(message, code, { ...details, statusCode, endpoint });
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.endpoint = endpoint;
    
    Object.setPrototypeOf(this, ApiError.prototype);
  }

  /**
   * 일반 에러로부터 ApiError 생성
   */
  static from(error: unknown, endpoint?: string): ApiError {
    if (error instanceof ApiError) return error;
    
    const message = error instanceof Error ? error.message : String(error);
    return new ApiError(message, 'API_ERROR', undefined, endpoint);
  }
}

/**
 * DART API 에러
 */
export class DartApiError extends ApiError {
  constructor(
    message: string,
    statusCode?: number,
    details?: Record<string, unknown>
  ) {
    super(message, 'DART_API_ERROR', statusCode, 'DART', details);
    this.name = 'DartApiError';
    
    Object.setPrototypeOf(this, DartApiError.prototype);
  }
}

// ============================================
// LLM 관련 에러
// ============================================

/**
 * LLM 호출 에러
 */
export class LLMError extends WorkflowError {
  public readonly provider?: string;
  public readonly model?: string;

  constructor(
    message: string,
    code: string = 'LLM_ERROR',
    provider?: string,
    model?: string,
    details?: Record<string, unknown>
  ) {
    super(message, code, { ...details, provider, model });
    this.name = 'LLMError';
    this.provider = provider;
    this.model = model;
    
    Object.setPrototypeOf(this, LLMError.prototype);
  }
}

/**
 * LLM 응답 파싱 에러
 */
export class LLMParseError extends LLMError {
  public readonly rawResponse?: string;

  constructor(
    message: string,
    provider?: string,
    model?: string,
    rawResponse?: string,
    details?: Record<string, unknown>
  ) {
    super(message, 'LLM_PARSE_ERROR', provider, model, details);
    this.name = 'LLMParseError';
    this.rawResponse = rawResponse;
    
    Object.setPrototypeOf(this, LLMParseError.prototype);
  }
}

/**
 * LLM Rate Limit 에러
 */
export class LLMRateLimitError extends LLMError {
  public readonly retryAfter?: number;

  constructor(
    message: string,
    provider?: string,
    model?: string,
    retryAfter?: number,
    details?: Record<string, unknown>
  ) {
    super(message, 'LLM_RATE_LIMIT', provider, model, details);
    this.name = 'LLMRateLimitError';
    this.retryAfter = retryAfter;
    
    Object.setPrototypeOf(this, LLMRateLimitError.prototype);
  }
}

// ============================================
// 검증 에러
// ============================================

/**
 * 입력 검증 에러
 */
export class ValidationError extends WorkflowError {
  public readonly field?: string;
  public readonly value?: unknown;

  constructor(
    message: string,
    field?: string,
    value?: unknown,
    details?: Record<string, unknown>
  ) {
    super(message, 'VALIDATION_ERROR', { ...details, field });
    this.name = 'ValidationError';
    this.field = field;
    this.value = value;
    
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

/**
 * 타입 검증 에러
 */
export class TypeError extends ValidationError {
  public readonly expectedType: string;
  public readonly actualType: string;

  constructor(
    message: string,
    field: string,
    expectedType: string,
    actualType: string,
    details?: Record<string, unknown>
  ) {
    super(message, field, undefined, { ...details, expectedType, actualType });
    this.name = 'TypeError';
    this.expectedType = expectedType;
    this.actualType = actualType;
    
    Object.setPrototypeOf(this, TypeError.prototype);
  }
}

// ============================================
// 실행 흐름 에러
// ============================================

/**
 * 타임아웃 에러
 */
export class TimeoutError extends WorkflowError {
  public readonly timeoutMs: number;

  constructor(
    message: string,
    timeoutMs: number,
    details?: Record<string, unknown>
  ) {
    super(message, 'TIMEOUT_ERROR', { ...details, timeoutMs });
    this.name = 'TimeoutError';
    this.timeoutMs = timeoutMs;
    
    Object.setPrototypeOf(this, TimeoutError.prototype);
  }
}

/**
 * 취소 에러
 */
export class CancellationError extends WorkflowError {
  public readonly reason?: string;

  constructor(
    message: string = '작업이 취소되었습니다.',
    reason?: string,
    details?: Record<string, unknown>
  ) {
    super(message, 'CANCELLATION_ERROR', { ...details, reason });
    this.name = 'CancellationError';
    this.reason = reason;
    
    Object.setPrototypeOf(this, CancellationError.prototype);
  }
}

/**
 * 최대 실행 횟수 초과 에러
 */
export class MaxExecutionsError extends WorkflowError {
  public readonly maxExecutions: number;
  public readonly actualExecutions: number;

  constructor(
    message: string,
    maxExecutions: number,
    actualExecutions: number,
    details?: Record<string, unknown>
  ) {
    super(message, 'MAX_EXECUTIONS_ERROR', { ...details, maxExecutions, actualExecutions });
    this.name = 'MaxExecutionsError';
    this.maxExecutions = maxExecutions;
    this.actualExecutions = actualExecutions;
    
    Object.setPrototypeOf(this, MaxExecutionsError.prototype);
  }
}

// ============================================
// 에러 유틸리티
// ============================================

/**
 * 에러인지 확인
 */
export function isWorkflowError(error: unknown): error is WorkflowError {
  return error instanceof WorkflowError;
}

/**
 * 에러 코드로 확인
 */
export function hasErrorCode(error: unknown, code: string): boolean {
  return isWorkflowError(error) && error.code === code;
}

/**
 * 에러 메시지 추출
 */
export function extractErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return '알 수 없는 오류가 발생했습니다.';
}

/**
 * 에러를 JSON 형태로 변환
 */
export function errorToJson(error: unknown): Record<string, unknown> {
  if (error instanceof WorkflowError) {
    return error.toJSON();
  }
  
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
  }
  
  return {
    message: String(error),
  };
}

// ============================================
// 내보내기
// ============================================

export default {
  WorkflowError,
  NodeExecutionError,
  NodeConfigError,
  NodeConnectionError,
  ApiError,
  DartApiError,
  LLMError,
  LLMParseError,
  LLMRateLimitError,
  ValidationError,
  TypeError,
  TimeoutError,
  CancellationError,
  MaxExecutionsError,
  isWorkflowError,
  hasErrorCode,
  extractErrorMessage,
  errorToJson,
};
