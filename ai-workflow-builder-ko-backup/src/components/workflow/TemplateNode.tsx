'use client';

import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { FileText, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { TemplateNodeData } from '@/types/workflow';
import { useWorkflowStore } from '@/lib/stores/workflow-store';

function TemplateNode({ id, data, selected }: NodeProps<TemplateNodeData>) {
  const { setSelectedNode, nodeResults } = useWorkflowStore();
  const result = nodeResults[id];

  const getStatusIcon = () => {
    if (!result) return null;
    if (result.status === 'running') return <Loader2 size={14} className="animate-spin text-blue-500" />;
    if (result.status === 'success') return <CheckCircle2 size={14} className="text-green-500" />;
    if (result.status === 'error') return <XCircle size={14} className="text-red-500" />;
    return null;
  };

  // 변수 추출해서 보여주기
  const variables = data.template?.match(/\{\{(\w+)\}\}/g) || [];
  const uniqueVars = [...new Set(variables)];

  return (
    <div
      onClick={() => setSelectedNode(id)}
      className={`
        bg-gradient-to-br from-sky-500 to-blue-600 min-w-[200px] rounded-lg shadow-lg border-2 transition-all duration-200
        ${selected ? 'border-white ring-2 ring-sky-500 ring-offset-2' : 'border-sky-300/50'}
      `}
    >
      {/* 헤더 */}
      <div className="flex items-center gap-2 px-3 py-2 bg-black/20 rounded-t-lg">
        <FileText size={16} className="text-white" />
        <span className="text-xs font-semibold text-white flex-1 truncate">
          {data.label || '빈칸 채우기'}
        </span>
        {getStatusIcon()}
      </div>

      {/* 내용 */}
      <div className="p-3 text-white">
        {/* 템플릿 미리보기 */}
        <div className="text-xs bg-black/20 p-2 rounded mb-2 font-mono truncate">
          {data.template?.slice(0, 50) || '{{변수}}를 입력하세요...'}
          {(data.template?.length || 0) > 50 && '...'}
        </div>

        {/* 변수 태그 */}
        {uniqueVars.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {uniqueVars.slice(0, 4).map((v, i) => (
              <span key={i} className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded">
                {v}
              </span>
            ))}
            {uniqueVars.length > 4 && (
              <span className="text-[10px] text-white/60">+{uniqueVars.length - 4}</span>
            )}
          </div>
        )}

        {/* 결과 */}
        {result?.output && (
          <div className="mt-2 p-2 bg-black/20 rounded text-xs truncate">
            ✅ {result.output.slice(0, 60)}...
          </div>
        )}
      </div>

      <Handle
        type="target"
        position={Position.Left}
        className="!w-3 !h-3 !bg-sky-300 !border-2 !border-white"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="!w-3 !h-3 !bg-blue-300 !border-2 !border-white"
      />
    </div>
  );
}

export default memo(TemplateNode);
