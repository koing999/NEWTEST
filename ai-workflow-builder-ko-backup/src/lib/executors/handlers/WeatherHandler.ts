import { ApiNodeData } from '@/types/workflow';
import { ApiResponse } from '../types';
import { BaseHandler } from './BaseHandler';
import { withRetry } from '../utils/retry';

export class WeatherHandler extends BaseHandler {
    static readonly preset = 'weather';

    async execute(data: ApiNodeData, input: string): Promise<ApiResponse> {
        const cityName = (data.presetConfig?.city as string) || input || 'Seoul';
        const city = encodeURIComponent(this.replaceInput(cityName, input));
        const url = `https://wttr.in/${city}?format=j1`;

        return withRetry(async () => {
            const result = await this.fetchJson(url);
            return {
                output: JSON.stringify(result, null, 2),
                statusCode: 200,
                metadata: { city: cityName }
            };
        }, { maxRetries: 2, delay: 500 });
    }
}
