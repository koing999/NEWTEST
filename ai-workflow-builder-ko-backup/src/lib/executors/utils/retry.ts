import { ApiError } from '../errors/ApiError';

interface RetryOptions {
    maxRetries?: number;
    delay?: number;
    shouldRetry?: (error: unknown) => boolean;
}

export async function withRetry<T>(
    fn: () => Promise<T>,
    options: RetryOptions = {}
): Promise<T> {
    const { maxRetries = 3, delay = 1000, shouldRetry } = options;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error) {
            // 마지막 시도면 에러 던짐
            if (attempt === maxRetries) throw error;

            // 재시도 불가능한 에러인지 확인
            if (error instanceof ApiError && !error.retryable) {
                throw error;
            }

            // 커스텀 재시도 조건 확인
            if (shouldRetry && !shouldRetry(error)) {
                throw error;
            }

            console.warn(`[Retry] Attempt ${attempt} failed. Retrying in ${delay}ms...`, error);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }

    throw new Error('Unreachable code in withRetry');
}
