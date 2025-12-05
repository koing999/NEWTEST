'use client';

import { InputNodeData } from '@/types/workflow';

interface InputConfigProps {
  data: InputNodeData;
  nodeId: string;
  updateNodeData: (nodeId: string, data: Partial<InputNodeData>) => void;
}

export function InputConfig({ data, nodeId, updateNodeData }: InputConfigProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">입력 타입</label>
        <select
          value={data.inputType}
          onChange={(e) => updateNodeData(nodeId, { inputType: e.target.value as 'text' | 'file' | 'json' })}
          className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
        >
          <option value="text">텍스트</option>
          <option value="json">JSON</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">플레이스홀더 텍스트</label>
        <input
          type="text"
          value={data.placeholder || ''}
          onChange={(e) => updateNodeData(nodeId, { placeholder: e.target.value })}
          className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
  );
}
