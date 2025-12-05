import { ApiNodeData } from '@/types/workflow';
import { ApiHandler, ApiResponse } from '../types';
import { ApiError } from '../errors/ApiError';

export abstract class BaseHandler implements ApiHandler {
    abstract execute(data: ApiNodeData, input: string): Promise<ApiResponse>;

    protected replaceInput(template: string, input: string): string {
        return template.replace(/\{\{input\}\}/g, input);
    }

    protected async fetchJson(url: string, options?: RequestInit): Promise<any> {
        try {
            const response = await fetch(url, {
                headers: { 'Content-Type': 'application/json', ...options?.headers },
                ...options,
            });

            if (!response.ok) {
                throw new ApiError(
                    `HTTP Error: ${response.status} ${response.statusText}`,
                    'NETWORK_ERROR',
                    response.status,
                    response.status >= 500 // 500번대 에러는 재시도 가능
                );
            }

            const text = await response.text();
            try {
                return JSON.parse(text);
            } catch {
                throw new ApiError('Invalid JSON response', 'INVALID_RESPONSE', response.status);
            }
        } catch (error) {
            if (error instanceof ApiError) throw error;
            throw new ApiError(String(error), 'NETWORK_ERROR', undefined, true);
        }
    }
}
