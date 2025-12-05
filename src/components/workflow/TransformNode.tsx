'use client';

import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Wand2, Code } from 'lucide-react';
import { TransformNodeData } from '@/types/workflow';
import { useWorkflowStore } from '@/lib/stores/workflow-store';

function TransformNode({ id, data, selected }: NodeProps<TransformNodeData>) {
  const { setSelectedNode } = useWorkflowStore();

  const getTransformLabel = () => {
    switch (data.transformType) {
      case 'json-extract':
        return 'JSON 추출';
      case 'json-to-csv':
        return 'JSON to CSV';
      case 'text-split':
        return '텍스트 분할';
      case 'regex':
        return '정규식 매칭';
      case 'template':
        return '템플릿';
      default:
        return '변환';
    }
  };

  return (
    <div
      className={`
        px-4 py-3 rounded-lg shadow-lg border-2 min-w-[180px] max-w-[240px]
        bg-gradient-to-br from-amber-50 to-yellow-100
        ${selected ? 'border-amber-500 ring-2 ring-amber-200' : 'border-amber-300'}
        transition-all duration-200 hover:shadow-xl
      `}
      onClick={() => setSelectedNode(id)}
    >
      {/* 입력 핸들 */}
      <Handle
        type="target"
        position={Position.Left}
        className="!w-3 !h-3 !bg-amber-500 !border-2 !border-white"
      />

      {/* 헤더 */}
      <div className="flex items-center gap-2 mb-2">
        <div className="p-1.5 rounded-md bg-amber-500 text-white">
          <Wand2 size={14} />
        </div>
        <span className="font-semibold text-amber-800 text-sm">
          {data.label}
        </span>
      </div>

      {/* 변환 타입 */}
      <div className="flex items-center gap-1 p-2 bg-white/60 rounded-md mb-2">
        <Code size={12} className="text-amber-600" />
        <span className="text-xs font-medium text-amber-700">
          {getTransformLabel()}
        </span>
      </div>

      {/* 설정 미리보기 */}
      {data.config && (
        <div className="text-[10px] text-amber-600 bg-white/40 rounded p-1.5">
          {data.config.jsonPath && (
            <div>경로: <code className="bg-amber-100 px-1 rounded">{data.config.jsonPath}</code></div>
          )}
          {data.config.template && (
            <div className="truncate">템플릿: {data.config.template.slice(0, 30)}...</div>
          )}
          {data.config.pattern && (
            <div>패턴: <code className="bg-amber-100 px-1 rounded">{data.config.pattern}</code></div>
          )}
        </div>
      )}

      {/* 결과 미리보기 */}
      {data.result && (
        <div className="mt-2 p-1.5 bg-green-50 rounded border border-green-200">
          <div className="text-[10px] text-green-600 truncate">
            {data.result.slice(0, 50)}...
          </div>
        </div>
      )}

      {/* 출력 핸들 */}
      <Handle
        type="source"
        position={Position.Right}
        className="!w-3 !h-3 !bg-amber-500 !border-2 !border-white"
      />
    </div>
  );
}

export default memo(TransformNode);
