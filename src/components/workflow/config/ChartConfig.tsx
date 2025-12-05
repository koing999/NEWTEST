'use client';

import { ChartNodeData } from '@/types/workflow';

interface ChartConfigProps {
  data: ChartNodeData;
  nodeId: string;
  updateNodeData: (nodeId: string, data: Partial<ChartNodeData>) => void;
}

export function ChartConfig({ data, nodeId, updateNodeData }: ChartConfigProps) {
  return (
    <div className="space-y-4">
      {/* 차트 타입 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">차트 유형</label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { value: 'bar', label: '📊 바', desc: '비교에 적합' },
            { value: 'line', label: '📈 라인', desc: '추이 분석' },
            { value: 'pie', label: '🥧 파이', desc: '비율 표시' },
          ].map((type) => (
            <button
              key={type.value}
              onClick={() => updateNodeData(nodeId, { chartType: type.value as 'bar' | 'line' | 'pie' })}
              className={`
                p-2 rounded-lg border-2 text-center transition-all
                ${data.chartType === type.value 
                  ? 'border-violet-500 bg-violet-50' 
                  : 'border-gray-200 hover:border-violet-300'}
              `}
            >
              <div className="text-lg">{type.label.split(' ')[0]}</div>
              <div className="text-xs text-gray-500">{type.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* 차트 제목 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">차트 제목</label>
        <input
          type="text"
          value={data.chartTitle || ''}
          onChange={(e) => updateNodeData(nodeId, { chartTitle: e.target.value })}
          placeholder="예: 매출액 추이"
          className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-violet-500"
        />
      </div>

      {/* 색상 테마 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">색상 테마</label>
        <select
          value={data.colorTheme || 'default'}
          onChange={(e) => updateNodeData(nodeId, { colorTheme: e.target.value as 'default' | 'warm' | 'cool' | 'mono' })}
          className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-violet-500"
        >
          <option value="default">기본 (다채로움)</option>
          <option value="warm">따뜻한 색상</option>
          <option value="cool">차가운 색상</option>
          <option value="mono">단색 계열</option>
        </select>
      </div>

      {/* 옵션들 */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="showLegend"
            checked={data.showLegend !== false}
            onChange={(e) => updateNodeData(nodeId, { showLegend: e.target.checked })}
            className="rounded border-gray-300 text-violet-600"
          />
          <label htmlFor="showLegend" className="text-sm text-gray-600">범례 표시</label>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="showValues"
            checked={data.showValues !== false}
            onChange={(e) => updateNodeData(nodeId, { showValues: e.target.checked })}
            className="rounded border-gray-300 text-violet-600"
          />
          <label htmlFor="showValues" className="text-sm text-gray-600">값 표시</label>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="showGrid"
            checked={data.showGrid !== false}
            onChange={(e) => updateNodeData(nodeId, { showGrid: e.target.checked })}
            className="rounded border-gray-300 text-violet-600"
          />
          <label htmlFor="showGrid" className="text-sm text-gray-600">그리드 표시</label>
        </div>
      </div>

      {/* 데이터 매핑 (고급) */}
      <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
        <div className="text-xs text-gray-700 font-medium mb-2">📌 데이터 매핑 (선택)</div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] text-gray-500">라벨 필드</label>
            <input
              type="text"
              value={data.labelField || ''}
              onChange={(e) => updateNodeData(nodeId, { labelField: e.target.value })}
              placeholder="name"
              className="w-full p-1 text-xs border border-gray-200 rounded"
            />
          </div>
          <div>
            <label className="text-[10px] text-gray-500">값 필드</label>
            <input
              type="text"
              value={data.valueField || ''}
              onChange={(e) => updateNodeData(nodeId, { valueField: e.target.value })}
              placeholder="value"
              className="w-full p-1 text-xs border border-gray-200 rounded"
            />
          </div>
        </div>
      </div>

      {/* 안내 */}
      <div className="p-3 bg-violet-50 rounded-lg border border-violet-200">
        <div className="text-xs text-violet-700 font-medium">📊 차트 노드 사용법</div>
        <ul className="text-[10px] text-violet-600 mt-1 space-y-0.5">
          <li>• JSON 배열 데이터를 차트로 시각화</li>
          <li>• 재무제표, 주가 데이터 등에 적합</li>
          <li>• 이미지로 저장하여 공유 가능</li>
        </ul>
      </div>
    </div>
  );
}
