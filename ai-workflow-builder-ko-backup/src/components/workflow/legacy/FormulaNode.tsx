'use client';

import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { FunctionSquare, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { FormulaNodeData } from '@/types/workflow';
import { useWorkflowStore } from '@/lib/stores/workflow-store';

function FormulaNode({ id, data, selected }: NodeProps<FormulaNodeData>) {
  const { setSelectedNode, nodeResults } = useWorkflowStore();
  const result = nodeResults[id];

  const getStatusIcon = () => {
    if (!result) return null;
    if (result.status === 'running') return <Loader2 size={14} className="animate-spin text-blue-500" />;
    if (result.status === 'success') return <CheckCircle2 size={14} className="text-green-500" />;
    if (result.status === 'error') return <XCircle size={14} className="text-red-500" />;
    return null;
  };

  const formulas = data.formulas || [];

  return (
    <div
      onClick={() => setSelectedNode(id)}
      className={`
        bg-gradient-to-br from-violet-500 to-purple-600 min-w-[220px] rounded-lg shadow-lg border-2 transition-all duration-200
        ${selected ? 'border-white ring-2 ring-violet-500 ring-offset-2' : 'border-violet-300/50'}
      `}
    >
      {/* 헤더 */}
      <div className="flex items-center gap-2 px-3 py-2 bg-black/20 rounded-t-lg">
        <FunctionSquare size={16} className="text-white" />
        <span className="text-xs font-semibold text-white flex-1 truncate">
          {data.label || '수식 계산'}
        </span>
        {getStatusIcon()}
      </div>

      {/* 내용 */}
      <div className="p-3 text-white">
        {/* 수식 미리보기 */}
        <div className="space-y-1.5 mb-2">
          {formulas.slice(0, 3).map((f, i) => (
            <div key={i} className="text-xs bg-black/20 px-2 py-1 rounded flex justify-between">
              <span className="text-white/70">{f.label || f.name}</span>
              <span className="font-mono text-violet-200">{f.formula.slice(0, 15)}...</span>
            </div>
          ))}
          {formulas.length > 3 && (
            <div className="text-[10px] text-white/50 text-center">
              +{formulas.length - 3}개 수식 더
            </div>
          )}
          {formulas.length === 0 && (
            <div className="text-xs text-white/50 text-center py-2">
              수식을 추가하세요
            </div>
          )}
        </div>

        {/* 결과 */}
        {result?.output && (
          <div className="mt-2 p-2 bg-black/20 rounded text-xs truncate">
            ✅ 계산 완료
          </div>
        )}
      </div>

      <Handle
        type="target"
        position={Position.Left}
        className="!w-3 !h-3 !bg-violet-300 !border-2 !border-white"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="!w-3 !h-3 !bg-purple-300 !border-2 !border-white"
      />
    </div>
  );
}

export default memo(FormulaNode);
