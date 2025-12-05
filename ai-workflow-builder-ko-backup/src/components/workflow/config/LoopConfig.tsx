'use client';

import { LoopNodeData } from '@/types/workflow';

interface LoopConfigProps {
  data: LoopNodeData;
  nodeId: string;
  updateNodeData: (nodeId: string, data: Partial<LoopNodeData>) => void;
}

export function LoopConfig({ data, nodeId, updateNodeData }: LoopConfigProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">반복 타입</label>
        <select
          value={data.loopType}
          onChange={(e) => updateNodeData(nodeId, { loopType: e.target.value as LoopNodeData['loopType'] })}
          className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500"
        >
          <option value="foreach">각 항목 (foreach)</option>
          <option value="count">횟수 반복</option>
          <option value="while">조건 반복 (while)</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">최대 반복 횟수</label>
        <input
          type="number"
          value={data.maxIterations}
          onChange={(e) => updateNodeData(nodeId, { maxIterations: parseInt(e.target.value) || 1 })}
          min={1}
          max={100}
          className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500"
        />
      </div>

      {data.loopType === 'foreach' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">구분자</label>
          <select
            value={data.delimiter || '\n'}
            onChange={(e) => updateNodeData(nodeId, { delimiter: e.target.value })}
            className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500"
          >
            <option value={'\n'}>줄바꿈</option>
            <option value=",">쉼표 (,)</option>
            <option value=";">세미콜론 (;)</option>
            <option value="|">파이프 (|)</option>
          </select>
          <p className="mt-1 text-xs text-gray-500">입력을 이 구분자로 나누어 각각 처리해요</p>
        </div>
      )}

      <div className="p-3 bg-cyan-50 rounded-lg border border-cyan-200">
        <p className="text-xs text-cyan-700">
          💡 <strong>반복</strong> 출력은 매 반복마다 실행할 노드에,<br/>
          <strong>완료</strong> 출력은 모든 반복 후 실행할 노드에 연결하세요
        </p>
      </div>
    </div>
  );
}
