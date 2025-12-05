'use client';

import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Calendar } from 'lucide-react';
import { useWorkflowStore } from '@/lib/stores/workflow-store';
import { DateTimeNodeData } from '@/types/workflow';

function DateTimeNode({ id, data, selected }: NodeProps<DateTimeNodeData>) {
  const { setSelectedNode, nodeResults } = useWorkflowStore();
  const result = nodeResults[id];

  const statusColor = {
    idle: 'border-gray-200',
    running: 'border-violet-400 shadow-lg shadow-violet-100',
    success: 'border-green-400',
    error: 'border-red-400',
  }[result?.status || 'idle'];

  const formatLabel = {
    'full': '전체 (연-월-일 시:분:초)',
    'date': '날짜만 (연-월-일)',
    'time': '시간만 (시:분:초)',
    'iso': 'ISO 형식',
    'custom': `커스텀 (${data.customFormat || 'YYYY-MM-DD'})`,
  }[data.format || 'full'];

  return (
    <div
      className={`
        bg-white rounded-xl border-2 ${statusColor}
        ${selected ? 'ring-2 ring-violet-500 ring-offset-2' : ''}
        shadow-md hover:shadow-lg transition-all duration-200
        min-w-[200px]
      `}
      onClick={() => setSelectedNode(id)}
    >
      {/* Header */}
      <div className="bg-violet-500 text-white px-4 py-2 rounded-t-lg flex items-center gap-2">
        <Calendar size={18} />
        <span className="font-medium">{data.label || '날짜/시간'}</span>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="text-xs text-gray-500 mb-2">
          {formatLabel}
        </div>
        
        {data.timezone && data.timezone !== 'Asia/Seoul' && (
          <div className="text-xs text-gray-400">
            🌍 {data.timezone}
          </div>
        )}

        {/* Result */}
        {result?.status === 'success' && result.output && (
          <div className="mt-3 p-2 bg-violet-50 rounded text-xs text-violet-700 font-mono">
            📅 {result.output}
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
        className="!bg-violet-500 !w-3 !h-3 !border-2 !border-white"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="!bg-violet-500 !w-3 !h-3 !border-2 !border-white"
      />
    </div>
  );
}

export default memo(DateTimeNode);
