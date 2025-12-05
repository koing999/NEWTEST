import { ApiHandler } from '../types';
import { DartHandler } from './DartHandler';
import { StockHandler } from './StockHandler';
import { NewsHandler } from './NewsHandler';
import { WeatherHandler } from './WeatherHandler';
import { BaseHandler } from './BaseHandler';

// Custom Handler for fallback
class CustomHandler extends BaseHandler {
    async execute(data: any, input: string) {
        const url = this.replaceInput(data.url || '', input);
        const method = data.method || 'GET';
        const headers = data.headers || {};
        const body = data.body ? this.replaceInput(data.body, input) : undefined;

        const result = await this.fetchJson(url, { method, headers, body });
        return {
            output: JSON.stringify(result, null, 2),
            statusCode: 200
        };
    }
}

export const handlers: Record<string, ApiHandler> = {
    [DartHandler.preset]: new DartHandler(),
    [StockHandler.preset]: new StockHandler(),
    'stock-us': new StockHandler(), // StockHandler handles both
    [NewsHandler.preset]: new NewsHandler(),
    [WeatherHandler.preset]: new WeatherHandler(),
    'custom': new CustomHandler(),
};
