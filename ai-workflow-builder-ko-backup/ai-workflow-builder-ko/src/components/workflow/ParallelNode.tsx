'use client';

import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { GitMerge, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { ParallelNodeData } from '@/types/workflow';
import { useWorkflowStore } from '@/lib/stores/workflow-store';

function ParallelNode({ id, data, selected }: NodeProps<ParallelNodeData>) {
  const { setSelectedNode, nodeResults } = useWorkflowStore();
  const result = nodeResults[id];

  const getStatusIcon = () => {
    if (!result) return null;
    if (result.status === 'running') return <Loader2 size={14} className="animate-spin text-blue-500" />;
    if (result.status === 'success') return <CheckCircle2 size={14} className="text-green-500" />;
    if (result.status === 'error') return <XCircle size={14} className="text-red-500" />;
    return null;
  };

  const branches = data.branches || 2;
  const strategy = data.mergeStrategy || 'all';
  
  const strategyLabels: Record<string, string> = {
    all: '모두 완료',
    first: '첫 번째',
    any: '아무거나',
  };

  return (
    <div
      onClick={() => setSelectedNode(id)}
      className={`
        bg-gradient-to-br from-fuchsia-500 to-purple-600 min-w-[200px] rounded-lg shadow-lg border-2 transition-all duration-200
        ${selected ? 'border-white ring-2 ring-fuchsia-500 ring-offset-2' : 'border-fuchsia-300/50'}
      `}
    >
      {/* 헤더 */}
      <div className="flex items-center gap-2 px-3 py-2 bg-black/20 rounded-t-lg">
        <GitMerge size={16} className="text-white" />
        <span className="text-xs font-semibold text-white flex-1 truncate">
          {data.label || '병렬 실행'}
        </span>
        {getStatusIcon()}
      </div>

      {/* 내용 */}
      <div className="p-3 text-white">
        <div className="flex items-center justify-center gap-2 mb-2">
          {Array.from({ length: branches }).map((_, i) => (
            <div
              key={i}
              className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold"
            >
              {i + 1}
            </div>
          ))}
        </div>

        <div className="text-center text-xs text-white/80">
          {branches}개 분기 → {strategyLabels[strategy]}
        </div>

        {/* 결과 */}
        {result?.output && (
          <div className="mt-2 p-2 bg-black/20 rounded text-xs">
            <div className="text-white/60 text-[10px] mb-1">결과:</div>
            <div className="text-white/90 truncate">
              {result.output.slice(0, 80)}
              {result.output.length > 80 && '...'}
            </div>
          </div>
        )}
      </div>

      {/* 입력 핸들 */}
      <Handle
        type="target"
        position={Position.Left}
        className="!w-3 !h-3 !bg-fuchsia-300 !border-2 !border-white"
      />

      {/* 출력 핸들들 - 분기 수만큼 */}
      {Array.from({ length: branches }).map((_, i) => (
        <Handle
          key={`branch-${i}`}
          type="source"
          position={Position.Right}
          id={`branch-${i}`}
          className="!w-3 !h-3 !bg-purple-300 !border-2 !border-white"
          style={{ top: `${30 + (i * 100) / branches}%` }}
        />
      ))}

      {/* 병합 완료 출력 */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="merged"
        className="!w-3 !h-3 !bg-white !border-2 !border-fuchsia-500"
      />
    </div>
  );
}

export default memo(ParallelNode);
