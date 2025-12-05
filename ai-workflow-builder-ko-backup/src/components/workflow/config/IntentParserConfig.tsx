'use client';

import { IntentParserNodeData } from '@/types/workflow';
import { Brain, Zap, MessageSquare, TrendingUp, Globe, Newspaper, Cloud, BarChart3 } from 'lucide-react';

interface Props {
  data: IntentParserNodeData;
  nodeId: string;
  updateNodeData: (nodeId: string, data: Partial<IntentParserNodeData>) => void;
}

export function IntentParserConfig({ data, nodeId, updateNodeData }: Props) {
  return (
    <div className="space-y-4">
      {/* 설명 */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg border border-purple-100">
        <div className="flex items-center gap-2 mb-2">
          <Brain className="w-5 h-5 text-purple-600" />
          <span className="font-medium text-purple-900">의도 분석 AI (통역사)</span>
        </div>
        <p className="text-sm text-gray-600">
          사람이 말하는 자연어를 분석하여 적절한 API와 AI 분석으로 연결합니다.
        </p>
      </div>

      {/* 지원 기능 */}
      <div className="space-y-2">
        <div className="text-sm font-medium text-gray-700">지원하는 요청</div>
        <div className="grid grid-cols-2 gap-2">
          {[
            { icon: BarChart3, label: 'DART 공시/재무', color: 'text-blue-600' },
            { icon: TrendingUp, label: '국내 주식/급등주', color: 'text-green-600' },
            { icon: Globe, label: '해외 주식', color: 'text-purple-600' },
            { icon: Newspaper, label: '뉴스 검색', color: 'text-orange-600' },
            { icon: Cloud, label: '날씨 정보', color: 'text-cyan-600' },
            { icon: MessageSquare, label: '일반 질문', color: 'text-gray-600' },
          ].map(item => (
            <div key={item.label} className="flex items-center gap-2 bg-gray-50 px-2 py-1.5 rounded text-xs">
              <item.icon className={`w-3.5 h-3.5 ${item.color}`} />
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 예시들 */}
      <div className="space-y-2">
        <div className="text-sm font-medium text-gray-700">변환 예시</div>
        <div className="bg-gray-50 rounded-lg p-3 space-y-3 text-xs">
          {/* 재무 분석 예시 */}
          <div className="border-b border-gray-200 pb-2">
            <div className="flex items-center gap-1 text-gray-500 mb-1">
              <MessageSquare className="w-3 h-3" /> 입력
            </div>
            <div className="text-gray-800 font-medium">"삼성전자 작년대비 어때?"</div>
            <div className="flex items-center gap-1 text-purple-600 mt-1">
              <Zap className="w-3 h-3" /> DART 재무제표 분석
            </div>
          </div>
          
          {/* 급등주 예시 */}
          <div className="border-b border-gray-200 pb-2">
            <div className="flex items-center gap-1 text-gray-500 mb-1">
              <MessageSquare className="w-3 h-3" /> 입력
            </div>
            <div className="text-gray-800 font-medium">"오늘 급등주 뭐야?"</div>
            <div className="flex items-center gap-1 text-green-600 mt-1">
              <Zap className="w-3 h-3" /> 국내 주식 급등주 조회
            </div>
          </div>

          {/* 해외 주식 예시 */}
          <div className="border-b border-gray-200 pb-2">
            <div className="flex items-center gap-1 text-gray-500 mb-1">
              <MessageSquare className="w-3 h-3" /> 입력
            </div>
            <div className="text-gray-800 font-medium">"테슬라 주가 얼마야?"</div>
            <div className="flex items-center gap-1 text-purple-600 mt-1">
              <Zap className="w-3 h-3" /> 해외 주식 (TSLA) 시세 조회
            </div>
          </div>

          {/* 뉴스 예시 */}
          <div>
            <div className="flex items-center gap-1 text-gray-500 mb-1">
              <MessageSquare className="w-3 h-3" /> 입력
            </div>
            <div className="text-gray-800 font-medium">"AI 관련 뉴스 찾아줘"</div>
            <div className="flex items-center gap-1 text-orange-600 mt-1">
              <Zap className="w-3 h-3" /> 뉴스 검색 (키워드: AI)
            </div>
          </div>
        </div>
      </div>

      {/* 분석 모드 */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">분석 모드</label>
        <select
          value={data.mode || 'auto'}
          onChange={(e) => updateNodeData(nodeId, { mode: e.target.value as 'auto' | 'financial' | 'general' })}
          className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="auto">🤖 자동 (모든 유형 처리)</option>
          <option value="financial">💰 금융/투자 특화</option>
          <option value="general">📝 일반 대화</option>
        </select>
      </div>

      {/* 커스텀 지시사항 */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">
          추가 지시사항 (선택)
        </label>
        <textarea
          value={data.customInstructions || ''}
          onChange={(e) => updateNodeData(nodeId, { customInstructions: e.target.value })}
          placeholder="예: 암호화폐 관련 질문도 처리해줘"
          rows={2}
          className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
        />
      </div>

      {/* 워크플로우 연결 가이드 */}
      <div className="bg-amber-50 p-3 rounded-lg border border-amber-200">
        <div className="text-sm font-medium text-amber-800 mb-2">📌 권장 워크플로우</div>
        <div className="text-xs text-amber-700 space-y-1">
          <div className="flex items-center gap-1">
            <span className="bg-emerald-100 px-1.5 py-0.5 rounded">입력</span>
            <span>→</span>
            <span className="bg-purple-100 px-1.5 py-0.5 rounded font-bold">의도분석</span>
            <span>→</span>
            <span className="bg-indigo-100 px-1.5 py-0.5 rounded">API호출</span>
            <span>→</span>
            <span className="bg-blue-100 px-1.5 py-0.5 rounded">AI분석</span>
          </div>
          <p className="mt-2">
            의도분석 결과의 <code className="bg-white px-1 rounded">requestType</code>으로 
            어떤 API를 호출할지 자동 결정됩니다.
          </p>
        </div>
      </div>
    </div>
  );
}
