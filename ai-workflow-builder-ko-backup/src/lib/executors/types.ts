import { ApiNodeData } from '@/types/workflow';

export type ApiPreset = 'dart' | 'stock-kr' | 'stock-us' | 'news' | 'weather' | 'custom';

export interface ApiResponse {
    output: string;
    statusCode?: number;
    metadata?: Record<string, any>;
}

export interface ApiHandler {
    execute(data: ApiNodeData, input: string): Promise<ApiResponse>;
}
