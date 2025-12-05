'use client';

import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Calculator, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { MathNodeData } from '@/types/workflow';
import { useWorkflowStore } from '@/lib/stores/workflow-store';

const operationLabels: Record<string, string> = {
  add: '➕ 더하기',
  subtract: '➖ 빼기',
  multiply: '✖️ 곱하기',
  divide: '➗ 나누기',
  percent: '% 퍼센트',
  round: '🔄 반올림',
  floor: '⬇️ 내림',
  ceil: '⬆️ 올림',
  abs: '|x| 절댓값',
};

const operationSymbols: Record<string, string> = {
  add: '+',
  subtract: '−',
  multiply: '×',
  divide: '÷',
  percent: '%',
  round: '≈',
  floor: '⌊⌋',
  ceil: '⌈⌉',
  abs: '| |',
};

function MathNode({ id, data, selected }: NodeProps<MathNodeData>) {
  const { setSelectedNode, nodeResults } = useWorkflowStore();
  const result = nodeResults[id];

  const getStatusIcon = () => {
    if (!result) return null;
    if (result.status === 'running') return <Loader2 size={14} className="animate-spin text-blue-500" />;
    if (result.status === 'success') return <CheckCircle2 size={14} className="text-green-500" />;
    if (result.status === 'error') return <XCircle size={14} className="text-red-500" />;
    return null;
  };

  const op = data.operation || 'add';
  const symbol = operationSymbols[op];

  return (
    <div
      onClick={() => setSelectedNode(id)}
      className={`
        bg-gradient-to-br from-emerald-500 to-teal-600 min-w-[180px] rounded-lg shadow-lg border-2 transition-all duration-200
        ${selected ? 'border-white ring-2 ring-emerald-500 ring-offset-2' : 'border-emerald-300/50'}
      `}
    >
      {/* 헤더 */}
      <div className="flex items-center gap-2 px-3 py-2 bg-black/20 rounded-t-lg">
        <Calculator size={16} className="text-white" />
        <span className="text-xs font-semibold text-white flex-1 truncate">
          {data.label || '계산기'}
        </span>
        {getStatusIcon()}
      </div>

      {/* 내용 */}
      <div className="p-3 text-white">
        {/* 연산 표시 */}
        <div className="text-center mb-2">
          <span className="text-2xl font-bold bg-white/20 px-3 py-1 rounded-lg">
            {symbol}
          </span>
        </div>

        {/* 연산 이름 */}
        <div className="text-center text-xs text-white/80">
          {operationLabels[op]}
        </div>

        {/* 입력값 미리보기 */}
        {(data.value1 || data.value2) && (
          <div className="mt-2 text-center text-xs bg-black/20 py-1 px-2 rounded">
            {data.value1 || '?'} {symbol} {data.value2 || '?'}
          </div>
        )}

        {/* 결과 */}
        {result?.output && (
          <div className="mt-2 p-2 bg-white/20 rounded text-center">
            <div className="text-lg font-bold">{result.output}</div>
          </div>
        )}
      </div>

      <Handle
        type="target"
        position={Position.Left}
        className="!w-3 !h-3 !bg-emerald-300 !border-2 !border-white"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="!w-3 !h-3 !bg-teal-300 !border-2 !border-white"
      />
    </div>
  );
}

export default memo(MathNode);
