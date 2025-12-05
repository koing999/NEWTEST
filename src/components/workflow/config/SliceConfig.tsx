'use client';

import { SliceNodeData } from '@/types/workflow';

interface SliceConfigProps {
  data: SliceNodeData;
  nodeId: string;
  updateNodeData: (nodeId: string, data: Partial<SliceNodeData>) => void;
}

export function SliceConfig({ data, nodeId, updateNodeData }: SliceConfigProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">자르기 단위</label>
        <select
          value={data.sliceType}
          onChange={(e) => updateNodeData(nodeId, { sliceType: e.target.value as SliceNodeData['sliceType'] })}
          className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-rose-500"
        >
          <option value="characters">글자 수</option>
          <option value="words">단어 수</option>
          <option value="lines">줄 수</option>
          <option value="tokens">토큰 수 (추정)</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">시작 위치</label>
        <input
          type="number"
          value={data.start || 0}
          onChange={(e) => updateNodeData(nodeId, { start: parseInt(e.target.value) || 0 })}
          min={0}
          className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-rose-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">끝 위치 (비우면 끝까지)</label>
        <input
          type="number"
          value={data.end || ''}
          onChange={(e) => updateNodeData(nodeId, { end: e.target.value ? parseInt(e.target.value) : undefined })}
          min={1}
          className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-rose-500"
        />
      </div>

      <div className="p-3 bg-rose-50 rounded-lg border border-rose-200">
        <p className="text-xs text-rose-700">
          💡 긴 텍스트를 잘라서 토큰을 절약하거나 필요한 부분만 추출할 수 있어요
        </p>
      </div>
    </div>
  );
}
