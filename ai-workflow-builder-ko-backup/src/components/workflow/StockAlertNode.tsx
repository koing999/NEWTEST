'use client';

import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { TrendingUp, CheckCircle2, XCircle, Loader2, Bell } from 'lucide-react';
import { StockAlertNodeData } from '@/types/workflow';
import { useWorkflowStore } from '@/lib/stores/workflow-store';

function StockAlertNode({ id, data, selected }: NodeProps<StockAlertNodeData>) {
  const { setSelectedNode, nodeResults } = useWorkflowStore();
  const result = nodeResults[id];

  const getStatusIcon = () => {
    if (!result) return null;
    if (result.status === 'running') return <Loader2 size={14} className="animate-spin text-blue-500" />;
    if (result.status === 'success') return <CheckCircle2 size={14} className="text-green-500" />;
    if (result.status === 'error') return <XCircle size={14} className="text-red-500" />;
    return null;
  };

  return (
    <div
      onClick={() => setSelectedNode(id)}
      className={`
        bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 min-w-[240px] rounded-lg shadow-lg border-2 transition-all duration-200
        ${selected ? 'border-white ring-2 ring-amber-500 ring-offset-2' : 'border-amber-300/50'}
      `}
    >
      {/* 헤더 */}
      <div className="flex items-center gap-2 px-3 py-2 bg-black/20 rounded-t-lg">
        <TrendingUp size={16} className="text-white" />
        <span className="text-xs font-semibold text-white flex-1 truncate">
          {data.label || '주식 급등락 알림'}
        </span>
        <Bell size={14} className="text-yellow-300" />
        {getStatusIcon()}
      </div>

      {/* 내용 */}
      <div className="p-3 text-white">
        {/* 조건 요약 */}
        <div className="grid grid-cols-1 gap-1.5 mb-2">
          <div className="text-xs bg-black/20 px-2 py-1.5 rounded flex justify-between">
            <span className="text-white/70">📈 고점 상승률</span>
            <span className="font-bold text-green-300">≥ {data.minHighRise || 18}%</span>
          </div>
          <div className="text-xs bg-black/20 px-2 py-1.5 rounded flex justify-between">
            <span className="text-white/70">📉 최대 하락폭</span>
            <span className="font-bold text-red-300">≤ {data.maxDropFromHigh || -8}%</span>
          </div>
          <div className="text-xs bg-black/20 px-2 py-1.5 rounded flex justify-between">
            <span className="text-white/70">💰 현재 상승률</span>
            <span className="font-bold text-yellow-300">≥ {data.minCurrentRise || 13}%</span>
          </div>
        </div>

        {/* 패턴 설명 */}
        <div className="text-[10px] text-white/60 text-center bg-black/10 rounded px-2 py-1">
          🎯 급등 → 조정 → 회복 패턴 감지
        </div>

        {/* 결과 */}
        {result?.output && (
          <div className="mt-2 p-2 bg-green-500/30 rounded text-xs">
            🔔 {JSON.parse(result.output)?.matchedCount || 0}개 종목 알림!
          </div>
        )}
      </div>

      <Handle
        type="target"
        position={Position.Left}
        className="!w-3 !h-3 !bg-amber-300 !border-2 !border-white"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="!w-3 !h-3 !bg-red-300 !border-2 !border-white"
      />
    </div>
  );
}

export default memo(StockAlertNode);
