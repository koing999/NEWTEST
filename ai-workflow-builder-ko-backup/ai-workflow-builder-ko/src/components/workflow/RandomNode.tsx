'use client';

import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Shuffle } from 'lucide-react';
import { useWorkflowStore } from '@/lib/stores/workflow-store';
import { RandomNodeData } from '@/types/workflow';

function RandomNode({ id, data, selected }: NodeProps<RandomNodeData>) {
  const { setSelectedNode, nodeResults } = useWorkflowStore();
  const result = nodeResults[id];

  const statusColor = {
    idle: 'border-gray-200',
    running: 'border-teal-400 shadow-lg shadow-teal-100',
    success: 'border-green-400',
    error: 'border-red-400',
  }[result?.status || 'idle'];

  return (
    <div
      className={`
        bg-white rounded-xl border-2 ${statusColor}
        ${selected ? 'ring-2 ring-teal-500 ring-offset-2' : ''}
        shadow-md hover:shadow-lg transition-all duration-200
        min-w-[200px]
      `}
      onClick={() => setSelectedNode(id)}
    >
      {/* Header */}
      <div className="bg-teal-500 text-white px-4 py-2 rounded-t-lg flex items-center gap-2">
        <Shuffle size={18} />
        <span className="font-medium">{data.label || '랜덤 뽑기'}</span>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="text-xs text-gray-500 mb-2">
          {data.count || 1}개 뽑기 {data.allowDuplicate ? '(중복 허용)' : '(중복 제외)'}
        </div>
        
        <div className="text-xs text-gray-400 truncate">
          구분자: {data.delimiter === '\n' ? '줄바꿈' : data.delimiter === ',' ? '쉼표' : `"${data.delimiter}"`}
        </div>

        {/* Result */}
        {result?.status === 'success' && result.output && (
          <div className="mt-3 p-2 bg-teal-50 rounded text-xs text-teal-700 font-mono">
            🎲 {result.output.slice(0, 50)}{result.output.length > 50 ? '...' : ''}
          </div>
        )}

        {result?.status === 'error' && (
          <div className="mt-3 p-2 bg-red-50 rounded text-xs text-red-600">
            ❌ {result.error}
          </div>
        )}
      </div>

      {/* Handles */}
      <Handle
        type="target"
        position={Position.Left}
        className="!bg-teal-500 !w-3 !h-3 !border-2 !border-white"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="!bg-teal-500 !w-3 !h-3 !border-2 !border-white"
      />
    </div>
  );
}

export default memo(RandomNode);
