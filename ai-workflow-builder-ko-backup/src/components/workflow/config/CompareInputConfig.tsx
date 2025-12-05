'use client';

import { CompareInputNodeData } from '@/types/workflow';

interface CompareInputConfigProps {
  data: CompareInputNodeData;
  nodeId: string;
  updateNodeData: (nodeId: string, data: Partial<CompareInputNodeData>) => void;
}

const presetCompanies = [
  { code: '005930', name: '삼성전자' },
  { code: '000660', name: 'SK하이닉스' },
  { code: '035720', name: '카카오' },
  { code: '035420', name: 'NAVER' },
  { code: '051910', name: 'LG화학' },
  { code: '006400', name: '삼성SDI' },
  { code: '005380', name: '현대차' },
  { code: '000270', name: '기아' },
  { code: '207940', name: '삼성바이오로직스' },
  { code: '373220', name: 'LG에너지솔루션' },
];

export function CompareInputConfig({ data, nodeId, updateNodeData }: CompareInputConfigProps) {
  const companies = data.companies || [];

  const addCompany = (code: string) => {
    if (!companies.includes(code)) {
      updateNodeData(nodeId, { companies: [...companies, code] });
    }
  };

  const removeCompany = (code: string) => {
    updateNodeData(nodeId, { companies: companies.filter(c => c !== code) });
  };

  return (
    <div className="space-y-4">
      {/* 비교 타입 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">비교 유형</label>
        <select
          value={data.compareType || 'financial'}
          onChange={(e) => updateNodeData(nodeId, { compareType: e.target.value as 'financial' | 'stock' | 'all' })}
          className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500"
        >
          <option value="financial">📊 재무제표 비교</option>
          <option value="stock">📈 주가/밸류에이션 비교</option>
          <option value="all">📋 종합 비교 (전체)</option>
        </select>
      </div>

      {/* 현재 선택된 기업 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          비교 대상 기업 ({companies.length}개)
        </label>
        {companies.length === 0 ? (
          <div className="p-4 border-2 border-dashed border-gray-200 rounded-lg text-center text-gray-400 text-sm">
            아래에서 기업을 선택하세요
          </div>
        ) : (
          <div className="space-y-1">
            {companies.map((code, index) => {
              const preset = presetCompanies.find(p => p.code === code);
              return (
                <div
                  key={code}
                  className="flex items-center justify-between p-2 bg-cyan-50 rounded-lg border border-cyan-200"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 flex items-center justify-center text-xs font-bold bg-cyan-500 text-white rounded-full">
                      {index + 1}
                    </span>
                    <span className="font-mono text-sm">{code}</span>
                    {preset && <span className="text-xs text-gray-500">({preset.name})</span>}
                  </div>
                  <button
                    onClick={() => removeCompany(code)}
                    className="text-red-400 hover:text-red-600 text-sm"
                  >
                    ✕
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 빠른 추가 - 프리셋 기업 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">빠른 추가</label>
        <div className="flex flex-wrap gap-1">
          {presetCompanies.filter(p => !companies.includes(p.code)).map((company) => (
            <button
              key={company.code}
              onClick={() => addCompany(company.code)}
              className="px-2 py-1 text-xs bg-gray-100 hover:bg-cyan-100 text-gray-700 rounded transition-colors"
            >
              {company.name}
            </button>
          ))}
        </div>
      </div>

      {/* 직접 입력 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">직접 입력 (쉼표로 구분)</label>
        <input
          type="text"
          placeholder="005930, 000660, 035720"
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              const codes = e.currentTarget.value.split(',').map(c => c.trim()).filter(Boolean);
              codes.forEach(code => addCompany(code));
              e.currentTarget.value = '';
            }
          }}
          className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500"
        />
        <p className="text-xs text-gray-500 mt-1">Enter 키로 추가</p>
      </div>

      {/* 안내 */}
      <div className="p-3 bg-cyan-50 rounded-lg border border-cyan-200">
        <div className="text-xs text-cyan-700 font-medium">📊 비교 분석 기능</div>
        <ul className="text-[10px] text-cyan-600 mt-1 space-y-0.5">
          <li>• 최대 5개 기업까지 동시 비교</li>
          <li>• 재무제표/밸류에이션 자동 비교</li>
          <li>• 표/차트 형식으로 출력</li>
        </ul>
      </div>
    </div>
  );
}
