'use client';

import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Filter, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { MultiFilterNodeData } from '@/types/workflow';
import { useWorkflowStore } from '@/lib/stores/workflow-store';

function MultiFilterNode({ id, data, selected }: NodeProps<MultiFilterNodeData>) {
  const { setSelectedNode, nodeResults } = useWorkflowStore();
  const result = nodeResults[id];

  const getStatusIcon = () => {
    if (!result) return null;
    if (result.status === 'running') return <Loader2 size={14} className="animate-spin text-blue-500" />;
    if (result.status === 'success') return <CheckCircle2 size={14} className="text-green-500" />;
    if (result.status === 'error') return <XCircle size={14} className="text-red-500" />;
    return null;
  };

  const conditions = data.conditions || [];
  const logic = data.logic || 'AND';

  const operatorLabels: Record<string, string> = {
    '>=': '≥',
    '<=': '≤',
    '>': '>',
    '<': '<',
    '==': '=',
    '!=': '≠',
    'contains': '포함',
    'not-contains': '미포함',
  };

  return (
    <div
      onClick={() => setSelectedNode(id)}
      className={`
        bg-gradient-to-br from-cyan-500 to-blue-600 min-w-[220px] rounded-lg shadow-lg border-2 transition-all duration-200
        ${selected ? 'border-white ring-2 ring-cyan-500 ring-offset-2' : 'border-cyan-300/50'}
      `}
    >
      {/* 헤더 */}
      <div className="flex items-center gap-2 px-3 py-2 bg-black/20 rounded-t-lg">
        <Filter size={16} className="text-white" />
        <span className="text-xs font-semibold text-white flex-1 truncate">
          {data.label || '복합 필터'}
        </span>
        <span className={`text-[10px] px-1.5 py-0.5 rounded ${logic === 'AND' ? 'bg-green-500' : 'bg-orange-500'}`}>
          {logic}
        </span>
        {getStatusIcon()}
      </div>

      {/* 내용 */}
      <div className="p-3 text-white">
        {/* 조건 미리보기 */}
        <div className="space-y-1.5 mb-2">
          {conditions.slice(0, 3).map((c, i) => (
            <div key={i} className="text-xs bg-black/20 px-2 py-1 rounded flex items-center gap-1">
              <span className="text-white/70">{c.field}</span>
              <span className="text-cyan-300">{operatorLabels[c.operator] || c.operator}</span>
              <span className="font-mono text-white">{c.value}</span>
            </div>
          ))}
          {conditions.length > 3 && (
            <div className="text-[10px] text-white/50 text-center">
              +{conditions.length - 3}개 조건 더
            </div>
          )}
          {conditions.length === 0 && (
            <div className="text-xs text-white/50 text-center py-2">
              조건을 추가하세요
            </div>
          )}
        </div>

        {/* 통과 모드 */}
        <div className="text-[10px] text-white/60 text-center">
          {data.passThrough ? '✅ 통과하는 항목만 출력' : '📊 true/false 반환'}
        </div>

        {/* 결과 */}
        {result?.output && (
          <div className="mt-2 p-2 bg-black/20 rounded text-xs truncate">
            ✅ 필터 완료
          </div>
        )}
      </div>

      <Handle
        type="target"
        position={Position.Left}
        className="!w-3 !h-3 !bg-cyan-300 !border-2 !border-white"
      />
      <Handle
        type="source"
        position={Position.Right}
        id="pass"
        style={{ top: '40%' }}
        className="!w-3 !h-3 !bg-green-400 !border-2 !border-white"
      />
      <Handle
        type="source"
        position={Position.Right}
        id="fail"
        style={{ top: '60%' }}
        className="!w-3 !h-3 !bg-red-400 !border-2 !border-white"
      />
    </div>
  );
}

export default memo(MultiFilterNode);
