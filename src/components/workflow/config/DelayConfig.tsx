'use client';

import { DelayNodeData } from '@/types/workflow';

interface DelayConfigProps {
  data: DelayNodeData;
  nodeId: string;
  updateNodeData: (nodeId: string, data: Partial<DelayNodeData>) => void;
}

export function DelayConfig({ data, nodeId, updateNodeData }: DelayConfigProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">대기 시간 (밀리초)</label>
        <input
          type="number"
          value={data.delayMs}
          onChange={(e) => updateNodeData(nodeId, { delayMs: parseInt(e.target.value) || 1000 })}
          min={100}
          max={60000}
          step={100}
          className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-yellow-500"
        />
        <p className="mt-1 text-xs text-gray-500">
          현재 설정: {(data.delayMs / 1000).toFixed(1)}초
        </p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {[500, 1000, 2000, 5000, 10000].map((ms) => (
          <button
            key={ms}
            onClick={() => updateNodeData(nodeId, { delayMs: ms })}
            className={`px-2 py-1 text-xs rounded ${
              data.delayMs === ms ? 'bg-yellow-500 text-white' : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            {ms >= 1000 ? `${ms / 1000}초` : `${ms}ms`}
          </button>
        ))}
      </div>

      <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
        <p className="text-xs text-yellow-700">
          💡 API 호출 사이에 대기 시간을 둬서 Rate Limit를 피할 수 있어요
        </p>
      </div>
    </div>
  );
}
