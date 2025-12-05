import { ApiNodeData } from '@/types/workflow';
import { ApiResponse } from '../types';
import { BaseHandler } from './BaseHandler';
import { ApiError } from '../errors/ApiError';

export class StockHandler extends BaseHandler {
    static readonly preset = 'stock-kr'; // 대표 preset

    async execute(data: ApiNodeData, input: string): Promise<ApiResponse> {
        const preset = data.preset;
        let url = '';

        // Intent Parser 데이터 처리
        let parsedIntent: Record<string, unknown> | null = null;
        try {
            parsedIntent = JSON.parse(input);
        } catch { }

        if (preset === 'stock-kr') {
            const stockCode = this.replaceInput(
                data.presetConfig?.stockCode || (parsedIntent?.stockCode as string) || input,
                input
            );
            if (!stockCode) throw new ApiError('종목코드가 필요합니다.', 'BAD_REQUEST');
            url = `https://m.stock.naver.com/api/stock/${stockCode}/basic`;
        } else if (preset === 'stock-us') {
            const symbol = this.replaceInput(
                data.presetConfig?.stockCode || (parsedIntent?.ticker as string) || input,
                input
            );
            if (!symbol) throw new ApiError('티커(Symbol)가 필요합니다.', 'BAD_REQUEST');
            url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=5d`;
        } else {
            throw new ApiError(`지원하지 않는 주식 프리셋: ${preset}`, 'UNKNOWN_PRESET');
        }

        const result = await this.fetchJson(url);
        return {
            output: JSON.stringify(result, null, 2),
            statusCode: 200,
            metadata: { preset, url }
        };
    }
}
