'use client';

import { ParallelNodeData } from '@/types/workflow';

interface ParallelConfigProps {
  data: ParallelNodeData;
  nodeId: string;
  updateNodeData: (nodeId: string, data: Partial<ParallelNodeData>) => void;
}

export function ParallelConfig({ data, nodeId, updateNodeData }: ParallelConfigProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">분기 수</label>
        <select
          value={data.branches}
          onChange={(e) => updateNodeData(nodeId, { branches: parseInt(e.target.value) })}
          className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-fuchsia-500"
        >
          <option value={2}>2개 분기</option>
          <option value={3}>3개 분기</option>
          <option value={4}>4개 분기</option>
          <option value={5}>5개 분기</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">병합 전략</label>
        <select
          value={data.mergeStrategy}
          onChange={(e) => updateNodeData(nodeId, { mergeStrategy: e.target.value as ParallelNodeData['mergeStrategy'] })}
          className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-fuchsia-500"
        >
          <option value="all">모두 완료 후 병합 (all)</option>
          <option value="first">첫 번째 완료 시 진행 (first)</option>
          <option value="any">아무거나 완료 시 진행 (any)</option>
        </select>
      </div>

      <div className="p-3 bg-fuchsia-50 rounded-lg border border-fuchsia-200 space-y-2">
        <p className="text-xs text-fuchsia-700 font-medium">💡 활용 예시</p>
        <ul className="text-xs text-fuchsia-700 space-y-1">
          <li>• 여러 LLM 결과 비교</li>
          <li>• 동시 API 호출</li>
          <li>• A/B 테스트</li>
        </ul>
      </div>
    </div>
  );
}
