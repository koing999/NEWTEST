'use client';

import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Code2, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { CodeNodeData } from '@/types/workflow';
import { useWorkflowStore } from '@/lib/stores/workflow-store';

function CodeNode({ id, data, selected }: NodeProps<CodeNodeData>) {
  const { setSelectedNode, nodeResults } = useWorkflowStore();
  const result = nodeResults[id];

  const getStatusIcon = () => {
    if (!result) return null;
    if (result.status === 'running') return <Loader2 size={14} className="animate-spin text-blue-500" />;
    if (result.status === 'success') return <CheckCircle2 size={14} className="text-green-500" />;
    if (result.status === 'error') return <XCircle size={14} className="text-red-500" />;
    return null;
  };

  // 코드 미리보기 (첫 3줄)
  const codePreview = (data.code || '// 코드 입력')
    .split('\n')
    .slice(0, 3)
    .join('\n');

  return (
    <div
      onClick={() => setSelectedNode(id)}
      className={`
        bg-gray-900 min-w-[220px] rounded-lg shadow-lg border-2 transition-all duration-200
        ${selected ? 'border-green-500 ring-2 ring-green-500 ring-offset-2' : 'border-gray-700'}
        ${result?.status === 'error' ? 'border-red-500' : ''}
      `}
    >
      {/* 헤더 */}
      <div className="flex items-center gap-2 px-3 py-2 bg-gray-800 rounded-t-lg border-b border-gray-700">
        <Code2 size={16} className="text-green-400" />
        <span className="text-xs font-semibold text-gray-200 flex-1 truncate">
          {data.label || '코드 실행'}
        </span>
        {getStatusIcon()}
      </div>

      {/* 코드 미리보기 */}
      <div className="p-3">
        <pre className="text-xs font-mono text-green-400 bg-black/30 p-2 rounded overflow-hidden">
          <code>{codePreview}</code>
        </pre>

        {/* 결과 */}
        {result?.output && (
          <div className="mt-2 p-2 bg-gray-800 rounded text-xs">
            <div className="text-gray-400 text-[10px] mb-1">결과:</div>
            <div className="text-green-300 font-mono truncate">
              {result.output.slice(0, 100)}
              {result.output.length > 100 && '...'}
            </div>
          </div>
        )}

        {/* 에러 */}
        {result?.error && (
          <div className="mt-2 p-2 bg-red-900/30 rounded text-xs text-red-300">
            ⚠️ {result.error}
          </div>
        )}
      </div>

      {/* 핸들 */}
      <Handle
        type="target"
        position={Position.Left}
        className="!w-3 !h-3 !bg-green-500 !border-2 !border-white"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="!w-3 !h-3 !bg-green-500 !border-2 !border-white"
      />
    </div>
  );
}

export default memo(CodeNode);
