'use client';

import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Scissors } from 'lucide-react';
import { useWorkflowStore } from '@/lib/stores/workflow-store';
import { SliceNodeData } from '@/types/workflow';

function SliceNode({ id, data, selected }: NodeProps<SliceNodeData>) {
  const { setSelectedNode, nodeResults } = useWorkflowStore();
  const result = nodeResults[id];

  const statusColor = {
    idle: 'border-gray-200',
    running: 'border-rose-400 shadow-lg shadow-rose-100',
    success: 'border-green-400',
    error: 'border-red-400',
  }[result?.status || 'idle'];

  const sliceTypeLabel = {
    'chars': '글자',
    'words': '단어',
    'lines': '줄',
    'tokens': '토큰(추정)',
  }[data.sliceType || 'chars'];

  return (
    <div
      className={`
        bg-white rounded-xl border-2 ${statusColor}
        ${selected ? 'ring-2 ring-rose-500 ring-offset-2' : ''}
        shadow-md hover:shadow-lg transition-all duration-200
        min-w-[200px]
      `}
      onClick={() => setSelectedNode(id)}
    >
      {/* Header */}
      <div className="bg-rose-500 text-white px-4 py-2 rounded-t-lg flex items-center gap-2">
        <Scissors size={18} />
        <span className="font-medium">{data.label || '텍스트 자르기'}</span>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="text-xs text-gray-500 mb-2">
          {sliceTypeLabel} 기준
        </div>
        
        <div className="text-xs text-gray-600 font-mono bg-gray-50 p-2 rounded">
          [{data.start || 0} : {data.end ?? '끝'}]
        </div>

        {/* Result */}
        {result?.status === 'success' && result.output && (
          <div className="mt-3 p-2 bg-rose-50 rounded text-xs text-rose-700 font-mono">
            ✂️ {result.output.slice(0, 50)}{result.output.length > 50 ? '...' : ''}
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
        className="!bg-rose-500 !w-3 !h-3 !border-2 !border-white"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="!bg-rose-500 !w-3 !h-3 !border-2 !border-white"
      />
    </div>
  );
}

export default memo(SliceNode);
