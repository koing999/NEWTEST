'use client';

import { StockAlertNodeData } from '@/types/workflow';

interface StockAlertConfigProps {
  data: StockAlertNodeData;
  nodeId: string;
  updateNodeData: (nodeId: string, data: Partial<StockAlertNodeData>) => void;
}

export function StockAlertConfig({ data, nodeId, updateNodeData }: StockAlertConfigProps) {
  return (
    <div className="space-y-4">
      <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
        <p className="text-xs text-amber-700 font-medium">📈 급등락 알림 조건 설정</p>
        <p className="text-[10px] text-amber-600 mt-1">
          모든 조건을 충족하는 종목만 알림
        </p>
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-[10px] text-gray-500 mb-1">최소 고점 상승률 (%)</label>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="5"
              max="50"
              value={data.minHighRise ?? 18}
              onChange={(e) => updateNodeData(nodeId, { minHighRise: parseInt(e.target.value) })}
              className="flex-1"
            />
            <span className="text-sm font-bold text-emerald-600 w-12">≥{data.minHighRise ?? 18}%</span>
          </div>
          <p className="text-[10px] text-gray-400">= (장중고가 / 시가 - 1) × 100</p>
        </div>

        <div>
          <label className="block text-[10px] text-gray-500 mb-1">최대 고점 대비 하락폭 (%)</label>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="-30"
              max="0"
              value={data.maxDropFromHigh ?? -8}
              onChange={(e) => updateNodeData(nodeId, { maxDropFromHigh: parseInt(e.target.value) })}
              className="flex-1"
            />
            <span className="text-sm font-bold text-red-600 w-12">≤{data.maxDropFromHigh ?? -8}%</span>
          </div>
          <p className="text-[10px] text-gray-400">= (장중저가 / 장중고가 - 1) × 100</p>
        </div>

        <div>
          <label className="block text-[10px] text-gray-500 mb-1">최소 현재 상승률 (%)</label>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="0"
              max="40"
              value={data.minCurrentRise ?? 13}
              onChange={(e) => updateNodeData(nodeId, { minCurrentRise: parseInt(e.target.value) })}
              className="flex-1"
            />
            <span className="text-sm font-bold text-amber-600 w-12">≥{data.minCurrentRise ?? 13}%</span>
          </div>
          <p className="text-[10px] text-gray-400">= (현재가 / 시가 - 1) × 100</p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">알림 메시지 템플릿</label>
        <textarea
          value={data.messageTemplate || ''}
          onChange={(e) => updateNodeData(nodeId, { messageTemplate: e.target.value })}
          placeholder="{{name}} | 고점 {{highRise}}% → 저점 {{maxDrop}}% → 현재 {{currentRise}}%"
          className="w-full p-2 border border-gray-300 rounded-lg text-xs resize-none"
          rows={3}
        />
        <p className="mt-1 text-[10px] text-gray-500">
          사용 가능: <code className="bg-gray-100 px-1 rounded">{'{{name}}'}</code>, 
          <code className="bg-gray-100 px-1 rounded">{'{{highRise}}'}</code>, 
          <code className="bg-gray-100 px-1 rounded">{'{{maxDrop}}'}</code>, 
          <code className="bg-gray-100 px-1 rounded">{'{{currentRise}}'}</code>
        </p>
      </div>

      <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-xs text-gray-700 font-medium">📊 입력 데이터 형식</p>
        <pre className="text-[10px] text-gray-600 bg-gray-100 p-2 rounded mt-1 overflow-x-auto">{`{
  "stocks": [
    { "name": "삼성전자", "open": 50000, 
      "high": 60000, "low": 45000, "current": 55000 },
    ...
  ]
}`}</pre>
      </div>
    </div>
  );
}
