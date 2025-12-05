'use client';

import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Download } from 'lucide-react';
import { useWorkflowStore } from '@/lib/stores/workflow-store';
import { FileSaveNodeData } from '@/types/workflow';

function FileSaveNode({ id, data, selected }: NodeProps<FileSaveNodeData>) {
  const { setSelectedNode, nodeResults } = useWorkflowStore();
  const result = nodeResults[id];

  const statusColor = {
    idle: 'border-gray-200',
    running: 'border-lime-400 shadow-lg shadow-lime-100',
    success: 'border-green-400',
    error: 'border-red-400',
  }[result?.status || 'idle'];

  const fileTypeLabel = {
    'txt': '📄 텍스트 (.txt)',
    'json': '📋 JSON (.json)',
    'csv': '📊 CSV (.csv)',
    'md': '📝 마크다운 (.md)',
  }[data.fileType || 'txt'];

  return (
    <div
      className={`
        bg-white rounded-xl border-2 ${statusColor}
        ${selected ? 'ring-2 ring-lime-500 ring-offset-2' : ''}
        shadow-md hover:shadow-lg transition-all duration-200
        min-w-[200px]
      `}
      onClick={() => setSelectedNode(id)}
    >
      {/* Header */}
      <div className="bg-lime-500 text-white px-4 py-2 rounded-t-lg flex items-center gap-2">
        <Download size={18} />
        <span className="font-medium">{data.label || '파일 저장'}</span>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="text-xs text-gray-500 mb-2">
          {fileTypeLabel}
        </div>
        
        <div className="text-xs text-gray-600 font-mono bg-gray-50 p-2 rounded truncate">
          {data.filename || 'output'}{data.appendDate ? '_날짜' : ''}.{data.fileType || 'txt'}
        </div>

        {/* Result */}
        {result?.status === 'success' && (
          <div className="mt-3 p-2 bg-lime-50 rounded text-xs text-lime-700">
            ✅ 다운로드 준비됨
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
        className="!bg-lime-500 !w-3 !h-3 !border-2 !border-white"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="!bg-lime-500 !w-3 !h-3 !border-2 !border-white"
      />
    </div>
  );
}

export default memo(FileSaveNode);
