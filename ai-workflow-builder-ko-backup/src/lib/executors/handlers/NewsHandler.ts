import { ApiNodeData } from '@/types/workflow';
import { ApiResponse } from '../types';
import { BaseHandler } from './BaseHandler';
import { ApiError } from '../errors/ApiError';

export class NewsHandler extends BaseHandler {
    static readonly preset = 'news';

    async execute(data: ApiNodeData, input: string): Promise<ApiResponse> {
        const keyword = (data.presetConfig?.query as string) || input;
        if (!keyword) {
            throw new ApiError('검색어가 필요합니다.', 'BAD_REQUEST');
        }

        const query = encodeURIComponent(this.replaceInput(keyword, input));
        const url = `https://news.google.com/rss/search?q=${query}&hl=ko&gl=KR&ceid=KR:ko`;

        const response = await fetch(url);
        if (!response.ok) {
            throw new ApiError(`News API Error: ${response.status}`, 'NETWORK_ERROR', response.status);
        }

        const text = await response.text();
        return {
            output: text,
            statusCode: response.status,
            metadata: { query: keyword }
        };
    }
}
