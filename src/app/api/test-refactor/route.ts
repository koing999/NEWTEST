import { NextResponse } from 'next/server';
import { executeApiCall } from '@/lib/executors/api-executor';
import { ApiNodeData } from '@/types/workflow';

export async function GET() {
    const results: Record<string, any> = {};

    try {
        // 1. Stock KR (Samsung Electronics)
        try {
            const stockKrData: ApiNodeData = {
                type: 'api', label: 'Stock KR', preset: 'stock-kr',
                presetConfig: { stockCode: '005930', market: 'kospi' },
                url: '', method: 'GET'
            };
            const res = await executeApiCall(stockKrData, '');
            results.stockKr = { success: true, status: res.statusCode, length: res.output.length };
        } catch (e) {
            results.stockKr = { success: false, error: String(e) };
        }

        // 2. News (AI Technology)
        try {
            const newsData: ApiNodeData = {
                type: 'api', label: 'News', preset: 'news',
                presetConfig: { query: 'AI Technology' },
                url: '', method: 'GET'
            };
            const res = await executeApiCall(newsData, '');
            results.news = { success: true, status: res.statusCode, length: res.output.length };
        } catch (e) {
            results.news = { success: false, error: String(e) };
        }

        // 3. Weather (Seoul)
        try {
            const weatherData: ApiNodeData = {
                type: 'api', label: 'Weather', preset: 'weather',
                presetConfig: { city: 'Seoul' },
                url: '', method: 'GET'
            };
            const res = await executeApiCall(weatherData, '');
            results.weather = { success: true, status: res.statusCode, length: res.output.length };
        } catch (e) {
            results.weather = { success: false, error: String(e) };
        }

        // 4. DART (Samsung Electronics)
        try {
            const dartData: ApiNodeData = {
                type: 'api', label: 'DART', preset: 'dart',
                presetConfig: { corpCode: '삼성전자', reportType: 'disclosure', dartApiKey: process.env.DART_API_KEY },
                url: '', method: 'GET'
            };
            const res = await executeApiCall(dartData, '');
            results.dart = { success: true, status: res.statusCode, length: res.output.length };
        } catch (e) {
            results.dart = { success: false, error: String(e) };
        }

        // 5. DART Financials (3 Years) + CSV Transform + AI Analysis
        try {
            // 5-1. Fetch 3 Years Data
            const dartFinancialData: ApiNodeData = {
                type: 'api', label: 'DART Financials', preset: 'dart',
                presetConfig: {
                    corpCode: '삼성전자',
                    reportType: 'financial',
                    yearCount: 3,
                    dartApiKey: process.env.DART_API_KEY
                },
                url: '', method: 'GET'
            };
            const apiRes = await executeApiCall(dartFinancialData, '');

            // 5-2. Transform to CSV
            const { executeTransform } = await import('@/lib/executors/transform-executor');
            const csvOutput = executeTransform({
                type: 'transform',
                label: 'JSON to CSV',
                transformType: 'json-to-csv',
                config: {}
            }, apiRes.output);

            // 5-3. AI Analysis (Accountant Persona)
            const { callLLM, buildMessages } = await import('@/lib/providers');
            const aiResponse = await callLLM({
                provider: 'groq',
                model: 'meta-llama/llama-4-maverick-17b-128e-instruct',
                messages: buildMessages(
                    `당신은 경력 20년의 베테랑 회계사입니다. 
                    제공된 3년치 재무제표 CSV 데이터를 분석하여 기업의 재무 건전성, 성장성, 수익성을 평가해주세요.
                    특히 유동자산, 부채비율, 영업이익 추이를 중점적으로 봐주세요.
                    결론은 "투자 적합" 또는 "투자 주의"로 명확하게 내려주세요.`,
                    `다음은 삼성전자의 최근 3년치 재무제표입니다:\n\n${csvOutput.slice(0, 3000)}`,
                    ''
                ),
                temperature: 0.3,
                maxTokens: 1000
            });

            results.dartFinancials = {
                success: true,
                status: apiRes.statusCode,
                itemCount: JSON.parse(apiRes.output).list.length,
                csvPreview: csvOutput.slice(0, 200) + '...',
                aiAnalysis: aiResponse.content
            };
        } catch (e) {
            results.dartFinancials = { success: false, error: String(e) };
        }

        return NextResponse.json({ success: true, results });
    } catch (error) {
        return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
    }
}
