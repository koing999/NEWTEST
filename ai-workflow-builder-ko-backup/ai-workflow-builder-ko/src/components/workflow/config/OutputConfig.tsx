'use client';

import { OutputNodeData } from '@/types/workflow';

interface OutputConfigProps {
  data: OutputNodeData;
  nodeId: string;
  updateNodeData: (nodeId: string, data: Partial<OutputNodeData>) => void;
}

export function OutputConfig({ data, nodeId, updateNodeData }: OutputConfigProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">출력 형식</label>
        <select
          value={data.outputType}
          onChange={(e) => updateNodeData(nodeId, { outputType: e.target.value as 'text' | 'json' | 'markdown' })}
          className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
        >
          <option value="text">일반 텍스트</option>
          <option value="json">JSON</option>
          <option value="markdown">마크다운</option>
        </select>
      </div>
    </div>
  );
}
