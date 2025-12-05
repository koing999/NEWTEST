'use client';

import { RandomNodeData } from '@/types/workflow';

interface RandomConfigProps {
  data: RandomNodeData;
  nodeId: string;
  updateNodeData: (nodeId: string, data: Partial<RandomNodeData>) => void;
}

export function RandomConfig({ data, nodeId, updateNodeData }: RandomConfigProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">구분자</label>
        <select
          value={data.delimiter || '\n'}
          onChange={(e) => updateNodeData(nodeId, { delimiter: e.target.value })}
          className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500"
        >
          <option value={'\n'}>줄바꿈</option>
          <option value=",">쉼표 (,)</option>
          <option value=";">세미콜론 (;)</option>
          <option value="|">파이프 (|)</option>
        </select>
        <p className="mt-1 text-xs text-gray-500">입력을 이 구분자로 나눠서 리스트를 만들어요</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">선택 개수</label>
        <input
          type="number"
          value={data.count || 1}
          onChange={(e) => updateNodeData(nodeId, { count: parseInt(e.target.value) || 1 })}
          min={1}
          max={100}
          className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500"
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="allowDuplicate"
          checked={data.allowDuplicate || false}
          onChange={(e) => updateNodeData(nodeId, { allowDuplicate: e.target.checked })}
          className="rounded border-gray-300"
        />
        <label htmlFor="allowDuplicate" className="text-sm text-gray-600">중복 허용</label>
      </div>

      <div className="p-3 bg-teal-50 rounded-lg border border-teal-200">
        <p className="text-xs text-teal-700">
          💡 입력을 구분자로 나눠서 랜덤하게 선택해요<br/>
          예: A/B 테스트, 랜덤 샘플링
        </p>
      </div>
    </div>
  );
}
