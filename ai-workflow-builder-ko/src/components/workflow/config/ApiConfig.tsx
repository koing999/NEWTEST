'use client';

import { ApiNodeData } from '@/types/workflow';

interface ApiConfigProps {
  data: ApiNodeData;
  nodeId: string;
  updateNodeData: (nodeId: string, data: Partial<ApiNodeData>) => void;
}

export function ApiConfig({ data, nodeId, updateNodeData }: ApiConfigProps) {
  return (
    <div className="space-y-4">
      {/* 프리셋 선택 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">API 프리셋</label>
        <select
          value={data.preset || 'custom'}
          onChange={(e) => {
            const preset = e.target.value as ApiNodeData['preset'];
            let defaultConfig: ApiNodeData['presetConfig'] = {};
            
            if (preset === 'dart') {
              defaultConfig = { reportType: 'disclosure' };
            } else if (preset === 'stock-kr') {
              defaultConfig = { market: 'kospi' };
            } else if (preset === 'stock-us') {
              defaultConfig = { market: 'nasdaq' };
            }
            
            updateNodeData(nodeId, { preset, presetConfig: defaultConfig, url: '' });
          }}
          className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
        >
          <option value="custom">🔧 커스텀 API</option>
          <option value="dart">📋 DART 공시</option>
          <option value="stock-kr">🇰🇷 한국 주식</option>
          <option value="stock-us">🇺🇸 미국 주식</option>
          <option value="news">📰 뉴스 검색</option>
          <option value="weather">🌤️ 날씨</option>
        </select>
      </div>

      {/* DART 설정 */}
      {data.preset === 'dart' && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">DART API 키</label>
            <input
              type="password"
              value={data.presetConfig?.dartApiKey || ''}
              onChange={(e) => updateNodeData(nodeId, { 
                presetConfig: { ...data.presetConfig, dartApiKey: e.target.value }
              })}
              placeholder="금감원에서 발급받은 API 키"
              className="w-full p-2 border border-gray-300 rounded-lg text-sm"
            />
            <p className="mt-1 text-xs text-gray-500">
              <a href="https://opendart.fss.or.kr" target="_blank" rel="noopener" className="text-indigo-600 hover:underline">
                opendart.fss.or.kr
              </a>에서 무료 발급
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">기업코드 (또는 종목코드)</label>
            <input
              type="text"
              value={data.presetConfig?.corpCode || ''}
              onChange={(e) => updateNodeData(nodeId, { 
                presetConfig: { ...data.presetConfig, corpCode: e.target.value }
              })}
              placeholder="예: 00126380 (삼성전자)"
              className="w-full p-2 border border-gray-300 rounded-lg text-sm"
            />
            <p className="mt-1 text-xs text-gray-500">
              입력 노드에서 받을 수도 있어요: <code className="bg-gray-100 px-1 rounded">{'{{input}}'}</code>
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">조회 유형</label>
            <select
              value={data.presetConfig?.reportType || 'disclosure'}
              onChange={(e) => updateNodeData(nodeId, { 
                presetConfig: { ...data.presetConfig, reportType: e.target.value as 'disclosure' | 'financial' | 'dividend' }
              })}
              className="w-full p-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="disclosure">📢 최근 공시</option>
              <option value="financial">📊 재무제표</option>
              <option value="dividend">💰 배당 정보</option>
            </select>
          </div>
        </>
      )}

      {/* 주식 설정 */}
      {(data.preset === 'stock-kr' || data.preset === 'stock-us') && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">종목코드</label>
            <input
              type="text"
              value={data.presetConfig?.stockCode || ''}
              onChange={(e) => updateNodeData(nodeId, { 
                presetConfig: { ...data.presetConfig, stockCode: e.target.value.toUpperCase() }
              })}
              placeholder={data.preset === 'stock-kr' ? '예: 005930 (삼성전자)' : '예: AAPL (애플)'}
              className="w-full p-2 border border-gray-300 rounded-lg text-sm"
            />
            <p className="mt-1 text-xs text-gray-500">
              입력에서 받기: <code className="bg-gray-100 px-1 rounded">{'{{input}}'}</code>
            </p>
          </div>
          {data.preset === 'stock-kr' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">시장</label>
              <select
                value={data.presetConfig?.market || 'kospi'}
                onChange={(e) => updateNodeData(nodeId, { 
                  presetConfig: { ...data.presetConfig, market: e.target.value as 'kospi' | 'kosdaq' | 'nyse' | 'nasdaq' }
                })}
                className="w-full p-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="kospi">코스피</option>
                <option value="kosdaq">코스닥</option>
              </select>
            </div>
          )}
        </>
      )}

      {/* 뉴스 설정 */}
      {data.preset === 'news' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">검색어</label>
          <input
            type="text"
            value={data.presetConfig?.query || ''}
            onChange={(e) => updateNodeData(nodeId, { 
              presetConfig: { ...data.presetConfig, query: e.target.value }
            })}
            placeholder="예: 삼성전자, AI, 반도체..."
            className="w-full p-2 border border-gray-300 rounded-lg text-sm"
          />
        </div>
      )}

      {/* 날씨 설정 */}
      {data.preset === 'weather' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">도시</label>
          <input
            type="text"
            value={data.presetConfig?.city || ''}
            onChange={(e) => updateNodeData(nodeId, { 
              presetConfig: { ...data.presetConfig, city: e.target.value }
            })}
            placeholder="예: Seoul, Busan..."
            className="w-full p-2 border border-gray-300 rounded-lg text-sm"
          />
        </div>
      )}

      {/* 커스텀 API 설정 */}
      {data.preset === 'custom' && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">HTTP 메소드</label>
            <select
              value={data.method}
              onChange={(e) => updateNodeData(nodeId, { method: e.target.value as 'GET' | 'POST' | 'PUT' | 'DELETE' })}
              className="w-full p-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="DELETE">DELETE</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">URL</label>
            <input
              type="text"
              value={data.url}
              onChange={(e) => updateNodeData(nodeId, { url: e.target.value })}
              placeholder="https://api.example.com/data"
              className="w-full p-2 border border-gray-300 rounded-lg text-sm"
            />
            <p className="mt-1 text-xs text-gray-500">
              <code className="bg-gray-100 px-1 rounded">{'{{input}}'}</code>로 동적 값 사용 가능
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">헤더 (JSON)</label>
            <textarea
              value={JSON.stringify(data.headers || {}, null, 2)}
              onChange={(e) => {
                try {
                  const headers = JSON.parse(e.target.value);
                  updateNodeData(nodeId, { headers });
                } catch {}
              }}
              placeholder='{"Authorization": "Bearer xxx"}'
              className="w-full p-2 border border-gray-300 rounded-lg text-sm font-mono resize-none"
              rows={3}
            />
          </div>
          {(data.method === 'POST' || data.method === 'PUT') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Body (JSON)</label>
              <textarea
                value={JSON.stringify(data.body || {}, null, 2)}
                onChange={(e) => {
                  try {
                    const body = JSON.parse(e.target.value);
                    updateNodeData(nodeId, { body });
                  } catch {}
                }}
                placeholder='{"key": "value"}'
                className="w-full p-2 border border-gray-300 rounded-lg text-sm font-mono resize-none"
                rows={4}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
