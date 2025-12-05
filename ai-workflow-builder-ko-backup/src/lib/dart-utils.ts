/**
 * DART API 유틸리티
 * 
 * DART OpenAPI에서 사용하는 기업코드(corp_code)와 
 * 거래소에서 사용하는 종목코드(stock_code)를 변환합니다.
 * 
 * 지원 기능:
 * - 회사명 → 기업코드 변환 (예: "삼성전자" → "00126380")
 * - 종목코드 → 기업코드 변환 (예: "005930" → "00126380")
 * - 비상장사 지원 (예: "쿠팡", "토스")
 */

// 기업 정보 타입
interface CompanyInfo {
  corpCode: string;
  corpName: string;
  stockCode: string | null;
  market: string | null;
  aliases?: string[];  // 별칭 (예: "삼전", "현차")
}

// 기업 데이터베이스 (회사명/종목코드 → 기업코드 매핑)
const COMPANY_DB: CompanyInfo[] = [
  // === KOSPI 대형주 ===
  { corpCode: '00126380', corpName: '삼성전자', stockCode: '005930', market: 'KOSPI', aliases: ['삼전', '삼성'] },
  { corpCode: '00164779', corpName: 'SK하이닉스', stockCode: '000660', market: 'KOSPI', aliases: ['하이닉스', 'SK반도체'] },
  { corpCode: '00401731', corpName: 'NAVER', stockCode: '035420', market: 'KOSPI', aliases: ['네이버'] },
  { corpCode: '00306293', corpName: '카카오', stockCode: '035720', market: 'KOSPI', aliases: ['카톡'] },
  { corpCode: '00164742', corpName: '현대자동차', stockCode: '005380', market: 'KOSPI', aliases: ['현차', '현대차'] },
  { corpCode: '00164788', corpName: '기아', stockCode: '000270', market: 'KOSPI', aliases: ['기아차'] },
  { corpCode: '00356361', corpName: 'LG화학', stockCode: '051910', market: 'KOSPI' },
  { corpCode: '00100848', corpName: '삼성SDI', stockCode: '006400', market: 'KOSPI', aliases: ['삼성에스디아이'] },
  { corpCode: '00413046', corpName: '셀트리온', stockCode: '068270', market: 'KOSPI' },
  { corpCode: '00806977', corpName: '삼성바이오로직스', stockCode: '207940', market: 'KOSPI', aliases: ['삼바', '삼성바이오'] },
  { corpCode: '00129227', corpName: 'LG', stockCode: '003550', market: 'KOSPI', aliases: ['엘지'] },
  { corpCode: '00104856', corpName: 'LG전자', stockCode: '066570', market: 'KOSPI', aliases: ['엘지전자'] },
  { corpCode: '00126186', corpName: '삼성물산', stockCode: '028260', market: 'KOSPI' },
  { corpCode: '00687032', corpName: 'SK', stockCode: '034730', market: 'KOSPI', aliases: ['에스케이'] },
  { corpCode: '00138547', corpName: 'SK이노베이션', stockCode: '096770', market: 'KOSPI' },
  { corpCode: '00155276', corpName: 'POSCO홀딩스', stockCode: '005490', market: 'KOSPI', aliases: ['포스코', '포스코홀딩스'] },
  { corpCode: '00231567', corpName: 'KB금융', stockCode: '105560', market: 'KOSPI', aliases: ['국민은행', 'KB'] },
  { corpCode: '00466666', corpName: '신한지주', stockCode: '055550', market: 'KOSPI', aliases: ['신한', '신한은행'] },
  { corpCode: '00120030', corpName: '하나금융지주', stockCode: '086790', market: 'KOSPI', aliases: ['하나은행', '하나'] },
  { corpCode: '00933711', corpName: '크래프톤', stockCode: '259960', market: 'KOSPI', aliases: ['배그', 'PUBG'] },
  { corpCode: '00107554', corpName: 'LG에너지솔루션', stockCode: '373220', market: 'KOSPI', aliases: ['엘지에너지', 'LGES'] },
  { corpCode: '00104107', corpName: 'LG디스플레이', stockCode: '034220', market: 'KOSPI' },
  { corpCode: '00356418', corpName: '하이브', stockCode: '352820', market: 'KOSPI', aliases: ['빅히트', 'BTS', '방탄'] },
  { corpCode: '00126181', corpName: '삼성생명', stockCode: '032830', market: 'KOSPI' },
  { corpCode: '00126255', corpName: '삼성화재', stockCode: '000810', market: 'KOSPI' },
  { corpCode: '00126389', corpName: '삼성전기', stockCode: '009150', market: 'KOSPI' },
  { corpCode: '00126485', corpName: '삼성중공업', stockCode: '010140', market: 'KOSPI' },
  { corpCode: '00155753', corpName: '현대모비스', stockCode: '012330', market: 'KOSPI' },
  { corpCode: '00155314', corpName: '현대건설', stockCode: '000720', market: 'KOSPI' },
  { corpCode: '00152336', corpName: '현대제철', stockCode: '004020', market: 'KOSPI' },
  { corpCode: '00143446', corpName: '두산에너빌리티', stockCode: '034020', market: 'KOSPI', aliases: ['두산중공업'] },
  { corpCode: '00241560', corpName: '두산밥캣', stockCode: '241560', market: 'KOSPI' },
  { corpCode: '00132912', corpName: '한화에어로스페이스', stockCode: '012450', market: 'KOSPI', aliases: ['한화항공'] },
  { corpCode: '00132867', corpName: '한화오션', stockCode: '042660', market: 'KOSPI', aliases: ['대우조선', '대우조선해양'] },
  { corpCode: '00132920', corpName: '한화솔루션', stockCode: '009830', market: 'KOSPI' },
  { corpCode: '00217372', corpName: 'KT', stockCode: '030200', market: 'KOSPI', aliases: ['케이티', '한국통신'] },
  { corpCode: '00138250', corpName: 'SK텔레콤', stockCode: '017670', market: 'KOSPI', aliases: ['SKT'] },
  { corpCode: '00104170', corpName: 'LG유플러스', stockCode: '032640', market: 'KOSPI', aliases: ['유플러스', 'LGU+'] },
  { corpCode: '00158953', corpName: '대한항공', stockCode: '003490', market: 'KOSPI' },
  { corpCode: '00119227', corpName: '롯데케미칼', stockCode: '011170', market: 'KOSPI' },
  { corpCode: '00118231', corpName: '롯데쇼핑', stockCode: '023530', market: 'KOSPI' },
  { corpCode: '00158474', corpName: 'GS건설', stockCode: '006360', market: 'KOSPI' },
  { corpCode: '00136574', corpName: 'CJ제일제당', stockCode: '097950', market: 'KOSPI' },

  // === KOSDAQ ===
  { corpCode: '01429840', corpName: '아이티아이즈', stockCode: '372800', market: 'KOSDAQ', aliases: ['IT아이즈'] },
  { corpCode: '00547583', corpName: '에코프로비엠', stockCode: '247540', market: 'KOSDAQ' },
  { corpCode: '00290956', corpName: '에코프로', stockCode: '086520', market: 'KOSDAQ' },
  { corpCode: '00780002', corpName: 'HLB', stockCode: '028300', market: 'KOSDAQ' },
  { corpCode: '00358545', corpName: '펄어비스', stockCode: '263750', market: 'KOSDAQ', aliases: ['검은사막'] },
  { corpCode: '00139722', corpName: 'JYP Ent.', stockCode: '035900', market: 'KOSDAQ', aliases: ['JYP', 'JYP엔터'] },
  { corpCode: '00419043', corpName: 'SM', stockCode: '041510', market: 'KOSDAQ', aliases: ['SM엔터', 'SM엔터테인먼트'] },
  { corpCode: '00328104', corpName: '위메이드', stockCode: '112040', market: 'KOSDAQ', aliases: ['미르4'] },
  { corpCode: '00547583', corpName: '엔씨소프트', stockCode: '036570', market: 'KOSPI', aliases: ['NC', '엔씨'] },
  { corpCode: '00395012', corpName: '카카오게임즈', stockCode: '293490', market: 'KOSDAQ' },
  { corpCode: '00482732', corpName: '넷마블', stockCode: '251270', market: 'KOSPI' },
  { corpCode: '00764788', corpName: '카카오뱅크', stockCode: '323410', market: 'KOSPI', aliases: ['카뱅'] },
  { corpCode: '00802788', corpName: '카카오페이', stockCode: '377300', market: 'KOSPI', aliases: ['카페'] },

  // === 비상장사 (DART에 공시하는 기업들) ===
  { corpCode: '01335752', corpName: '쿠팡', stockCode: null, market: 'NYSE', aliases: ['Coupang'] },
  { corpCode: '01241163', corpName: '비바리퍼블리카', stockCode: null, market: null, aliases: ['토스', 'Toss', '토스뱅크'] },
  { corpCode: '01366892', corpName: '당근마켓', stockCode: null, market: null, aliases: ['당근'] },
  { corpCode: '01281893', corpName: '야놀자', stockCode: null, market: null, aliases: ['Yanolja'] },
  { corpCode: '01089920', corpName: '무신사', stockCode: null, market: null, aliases: ['MUSINSA'] },
  { corpCode: '01140203', corpName: '마켓컬리', stockCode: null, market: null, aliases: ['컬리', 'Kurly'] },
  { corpCode: '00860532', corpName: '배달의민족', stockCode: null, market: null, aliases: ['배민', '우아한형제들'] },
  { corpCode: '01012893', corpName: '직방', stockCode: null, market: null },
  { corpCode: '00912834', corpName: '오늘의집', stockCode: null, market: null, aliases: ['버킷플레이스'] },
];

// 종목코드 → 기업코드 캐시 (런타임 추가용)
const RUNTIME_CACHE: Record<string, string> = {};

/**
 * 회사명으로 기업 검색 (퍼지 매칭 지원)
 */
export function searchByName(query: string): CompanyInfo | null {
  const normalized = query.trim().toLowerCase().replace(/\s+/g, '');
  
  // 1. 정확한 회사명 매칭
  const exactMatch = COMPANY_DB.find(c => 
    c.corpName.toLowerCase().replace(/\s+/g, '') === normalized
  );
  if (exactMatch) return exactMatch;

  // 2. 별칭 매칭
  const aliasMatch = COMPANY_DB.find(c => 
    c.aliases?.some(alias => alias.toLowerCase().replace(/\s+/g, '') === normalized)
  );
  if (aliasMatch) return aliasMatch;

  // 3. 부분 매칭 (회사명에 검색어 포함)
  const partialMatch = COMPANY_DB.find(c => 
    c.corpName.toLowerCase().includes(normalized) ||
    normalized.includes(c.corpName.toLowerCase().replace(/\s+/g, ''))
  );
  if (partialMatch) return partialMatch;

  // 4. 별칭 부분 매칭
  const aliasPartial = COMPANY_DB.find(c => 
    c.aliases?.some(alias => 
      alias.toLowerCase().includes(normalized) || normalized.includes(alias.toLowerCase())
    )
  );
  if (aliasPartial) return aliasPartial;

  return null;
}

/**
 * 종목코드로 기업 검색
 */
export function searchByStockCode(stockCode: string): CompanyInfo | null {
  const cleaned = stockCode.replace(/^0+/, '').padStart(6, '0');
  return COMPANY_DB.find(c => c.stockCode === cleaned) || null;
}

/**
 * 기업코드로 기업 검색
 */
export function searchByCorpCode(corpCode: string): CompanyInfo | null {
  const cleaned = corpCode.padStart(8, '0');
  return COMPANY_DB.find(c => c.corpCode === cleaned) || null;
}

/**
 * 입력값이 회사명인지, 종목코드인지, 기업코드인지 판단
 */
export function detectInputType(input: string): 'name' | 'stockCode' | 'corpCode' {
  const cleaned = input.trim();
  
  // 숫자만 있는 경우
  if (/^\d+$/.test(cleaned)) {
    // 8자리 이상 → 기업코드
    if (cleaned.length >= 8) return 'corpCode';
    // 6자리 이하 → 종목코드
    return 'stockCode';
  }
  
  // 문자가 포함되면 회사명
  return 'name';
}

/**
 * 어떤 형식으로든 입력받아서 기업코드 반환
 * - 회사명: "삼성전자", "삼전", "카카오"
 * - 종목코드: "005930", "372800"
 * - 기업코드: "00126380" (그대로 반환)
 */
export async function resolveCorpCode(
  input: string, 
  dartApiKey?: string
): Promise<{ 
  corpCode: string; 
  corpName: string | null;
  resolved: boolean; 
  inputType: 'name' | 'stockCode' | 'corpCode';
  market: string | null;
}> {
  const inputType = detectInputType(input);
  
  // 1. 회사명으로 검색
  if (inputType === 'name') {
    const company = searchByName(input);
    if (company) {
      return {
        corpCode: company.corpCode,
        corpName: company.corpName,
        resolved: true,
        inputType: 'name',
        market: company.market,
      };
    }
    // 못 찾으면 실패
    return {
      corpCode: '',
      corpName: null,
      resolved: false,
      inputType: 'name',
      market: null,
    };
  }

  // 2. 기업코드 (8자리)
  if (inputType === 'corpCode') {
    const cleaned = input.trim().padStart(8, '0');
    const company = searchByCorpCode(cleaned);
    return {
      corpCode: cleaned,
      corpName: company?.corpName || null,
      resolved: true,
      inputType: 'corpCode',
      market: company?.market || null,
    };
  }

  // 3. 종목코드 (6자리)
  const cleaned = input.trim().replace(/^0+/, '').padStart(6, '0');
  
  // 3-1. 로컬 DB에서 검색
  const company = searchByStockCode(cleaned);
  if (company) {
    return {
      corpCode: company.corpCode,
      corpName: company.corpName,
      resolved: true,
      inputType: 'stockCode',
      market: company.market,
    };
  }

  // 3-2. 런타임 캐시 확인
  if (RUNTIME_CACHE[cleaned]) {
    return {
      corpCode: RUNTIME_CACHE[cleaned],
      corpName: null,
      resolved: true,
      inputType: 'stockCode',
      market: null,
    };
  }

  // 3-3. DART API로 실시간 조회
  if (dartApiKey) {
    try {
      const searchUrl = `https://opendart.fss.or.kr/api/list.json?crtfc_key=${dartApiKey}&stock_code=${cleaned}&page_count=1`;
      const response = await fetch(searchUrl, { 
        signal: AbortSignal.timeout(10000) // 10초 타임아웃
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.status === '000' && data.list && data.list.length > 0) {
          const corpCode = data.list[0].corp_code;
          const corpName = data.list[0].corp_name;
          // 캐시에 저장
          RUNTIME_CACHE[cleaned] = corpCode;
          console.log(`[DART] API 조회 성공: ${cleaned} → ${corpCode} (${corpName})`);
          return {
            corpCode,
            corpName,
            resolved: true,
            inputType: 'stockCode',
            market: null,
          };
        }
      }
    } catch (error) {
      console.warn(`[DART] API 조회 실패:`, error);
    }
  }

  // 못 찾으면 종목코드를 8자리로 패딩해서 반환 (fallback)
  return {
    corpCode: cleaned.padStart(8, '0'),
    corpName: null,
    resolved: false,
    inputType: 'stockCode',
    market: null,
  };
}

/**
 * 기업 목록 검색 (자동완성용)
 */
export function searchCompanies(query: string, limit: number = 10): CompanyInfo[] {
  if (!query || query.length < 1) return [];
  
  const normalized = query.trim().toLowerCase();
  const results: CompanyInfo[] = [];
  
  for (const company of COMPANY_DB) {
    // 회사명 매칭
    if (company.corpName.toLowerCase().includes(normalized)) {
      results.push(company);
      continue;
    }
    // 별칭 매칭
    if (company.aliases?.some(a => a.toLowerCase().includes(normalized))) {
      results.push(company);
      continue;
    }
    // 종목코드 매칭
    if (company.stockCode?.includes(normalized)) {
      results.push(company);
    }
    
    if (results.length >= limit) break;
  }
  
  return results;
}

/**
 * DART API 에러 메시지 한글화
 */
export function getDartErrorMessage(status: string): string {
  const errorMessages: Record<string, string> = {
    '000': '정상',
    '010': '등록되지 않은 API 키입니다.',
    '011': 'API 키 사용량을 초과했습니다. (일 10,000회)',
    '012': '아이피가 차단되었습니다.',
    '013': '조회된 데이터가 없습니다.',
    '014': '해당 서비스를 찾을 수 없습니다.',
    '020': '요청값이 올바르지 않습니다.',
    '100': '필드 에러입니다.',
    '900': '서버 오류입니다.',
  };
  
  return errorMessages[status] || `알 수 없는 오류 (${status})`;
}

/**
 * 전체 기업 목록 반환
 */
export function getAllCompanies(): CompanyInfo[] {
  return [...COMPANY_DB];
}

/**
 * 상장사만 반환
 */
export function getListedCompanies(): CompanyInfo[] {
  return COMPANY_DB.filter(c => c.stockCode !== null);
}

/**
 * 비상장사만 반환
 */
export function getUnlistedCompanies(): CompanyInfo[] {
  return COMPANY_DB.filter(c => c.stockCode === null);
}
