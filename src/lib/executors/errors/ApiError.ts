export type ApiErrorCode =
    | 'NETWORK_ERROR'      // 네트워크 연결 실패
    | 'RATE_LIMITED'       // API 호출 제한 초과
    | 'INVALID_RESPONSE'   // 응답 파싱 실패
    | 'AUTH_FAILED'        // API 키 인증 실패
    | 'BAD_REQUEST'        // 잘못된 요청 파라미터
    | 'NOT_FOUND'          // 데이터 없음
    | 'UPSTREAM_ERROR'     // 외부 API 오류 (DART 등)
    | 'UNKNOWN_PRESET'     // 지원하지 않는 프리셋
    | 'UNKNOWN_ERROR';     // 알 수 없는 오류

export class ApiError extends Error {
    constructor(
        message: string,
        public code: ApiErrorCode,
        public statusCode?: number,
        public retryable: boolean = false
    ) {
        super(message);
        this.name = 'ApiError';
    }

    static from(error: unknown, defaultCode: ApiErrorCode = 'UNKNOWN_ERROR'): ApiError {
        if (error instanceof ApiError) {
            return error;
        }
        if (error instanceof Error) {
            return new ApiError(error.message, defaultCode);
        }
        return new ApiError(String(error), defaultCode);
    }
}
