import { ApiNodeData } from '@/types/workflow';
import { ApiResponse } from '../types';
import { BaseHandler } from './BaseHandler';
import { ApiError } from '../errors/ApiError';
import { resolveCorpCode, getDartErrorMessage } from '@/lib/dart-utils';

export class DartHandler extends BaseHandler {
    static readonly preset = 'dart';

    async execute(data: ApiNodeData, input: string): Promise<ApiResponse> {
        const apiKey = data.presetConfig?.dartApiKey || process.env.DART_API_KEY || '';
        if (!apiKey) {
            throw new ApiError('DART API 키가 필요합니다.', 'AUTH_FAILED');
        }

        const rawInput = this.replaceInput(data.presetConfig?.corpCode || input, input);
        const reportType = data.presetConfig?.reportType || 'disclosure';

        // 기업 코드 변환
        const { corpCode, resolved, inputType } = await resolveCorpCode(rawInput, apiKey);

        if (!resolved) {
            if (inputType === 'name') {
                throw new ApiError(`'${rawInput}' 회사를 찾을 수 없습니다.`, 'NOT_FOUND');
            }
            console.warn(`[DART] ${rawInput} → corp_code 변환 실패`);
        }

        let results: any[] = [];
        const yearCount = data.presetConfig?.yearCount || 1;

        if (reportType === 'disclosure') {
            const today = new Date();
            const threeMonthsAgo = new Date(today.setMonth(today.getMonth() - 3));
            const bgnDe = threeMonthsAgo.toISOString().slice(0, 10).replace(/-/g, '');
            const url = `https://opendart.fss.or.kr/api/list.json?crtfc_key=${apiKey}&corp_code=${corpCode}&bgn_de=${bgnDe}&page_count=10`;
            const res = await this.fetchJson(url);
            if (res.status === '000') results = res.list || [];
            else if (res.status !== '013') throw new ApiError(`DART 오류: ${getDartErrorMessage(res.status)}`, 'UPSTREAM_ERROR');
        }
        else if (reportType === 'financial') {
            const currentYear = new Date().getFullYear();
            const promises = [];

            // 최근 N년치 데이터 조회
            for (let i = 1; i <= yearCount; i++) {
                const year = currentYear - i; // 작년, 재작년...
                // fnlttSinglAcntAll: 단일회사 전체 재무제표 (계정별 상세 포함)
                // fs_div=CFS: 연결재무제표 (Consolidated)
                // reprt_code=11011: 사업보고서 (연간)
                const url = `https://opendart.fss.or.kr/api/fnlttSinglAcntAll.json?crtfc_key=${apiKey}&corp_code=${corpCode}&bsns_year=${year}&reprt_code=11011&fs_div=CFS`;

                promises.push(
                    this.fetchJson(url)
                        .then(res => ({ year, res }))
                        .catch(err => ({ year, res: { status: 'error', message: err.message } }))
                );
            }

            const responses = await Promise.all(promises);

            for (const { year, res } of responses) {
                if (res.status === '000' && Array.isArray(res.list)) {
                    // 데이터에 연도 추가하여 병합
                    const yearData = res.list.map((item: any) => ({
                        ...item,
                        bsns_year: year, // 연도 명시
                        account_nm: item.account_nm || item.account_name, // 필드명 통일
                        thstrm_amount: item.thstrm_amount || item.this_term_amount, // 금액 필드
                    }));
                    results.push(...yearData);
                } else if (res.status !== '013') { // 013: 데이터 없음 (무시)
                    console.warn(`[DART] ${year}년 재무제표 조회 실패: ${res.message || 'Unknown error'}`);
                }
            }

            if (results.length === 0) {
                // 연결재무제표가 없으면 개별재무제표(OFS)로 재시도
                console.log('[DART] 연결재무제표 없음, 개별재무제표(OFS) 시도');
                results = []; // 초기화
                const retryPromises = [];
                for (let i = 1; i <= yearCount; i++) {
                    const year = currentYear - i;
                    const url = `https://opendart.fss.or.kr/api/fnlttSinglAcntAll.json?crtfc_key=${apiKey}&corp_code=${corpCode}&bsns_year=${year}&reprt_code=11011&fs_div=OFS`;
                    retryPromises.push(this.fetchJson(url).then(res => ({ year, res })));
                }

                const retryResponses = await Promise.all(retryPromises);
                for (const { year, res } of retryResponses) {
                    if (res.status === '000' && Array.isArray(res.list)) {
                        const yearData = res.list.map((item: any) => ({
                            ...item,
                            bsns_year: year,
                            fs_div: 'OFS' // 개별 표시
                        }));
                        results.push(...yearData);
                    }
                }
            }

            if (results.length === 0) {
                throw new ApiError('조회된 재무제표 데이터가 없습니다. (최근 3년 사업보고서 미공시 등)', 'NOT_FOUND');
            }
        }
        else if (reportType === 'dividend') {
            const url = `https://opendart.fss.or.kr/api/alotMatter.json?crtfc_key=${apiKey}&corp_code=${corpCode}`;
            const res = await this.fetchJson(url);
            if (res.status === '000') results = res.list || [];
        }

        return {
            output: JSON.stringify({ status: '000', message: '정상', list: results }, null, 2),
            statusCode: 200,
            metadata: { corpCode, reportType, yearCount }
        };
    }
}
