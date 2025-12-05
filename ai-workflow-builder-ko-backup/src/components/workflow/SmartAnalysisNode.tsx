'use client';

import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Sparkles, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { SmartAnalysisNodeData } from '@/types/workflow';
import { useWorkflowStore } from '@/lib/stores/workflow-store';

function SmartAnalysisNode({ id, data, selected }: NodeProps<SmartAnalysisNodeData>) {
  const { setSelectedNode, nodeResults } = useWorkflowStore();
  const nodeResult = nodeResults[id];

  const getStatusIcon = () => {
    if (!nodeResult) return null;
    switch (nodeResult.status) {
      case 'running':
        return <Loader2 className="w-4 h-4 animate-spin text-purple-500" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <div
      className={`
        px-4 py-3 rounded-xl shadow-lg border-2 min-w-[220px] max-w-[300px]
        bg-gradient-to-br from-violet-100 via-purple-50 to-pink-100 
        border-purple-300
        ${selected ? 'ring-2 ring-purple-400 border-purple-500' : ''}
        transition-all duration-200 hover:shadow-xl
      `}
      onClick={() => setSelectedNode(id)}
    >
      {/* 입력 핸들 */}
      <Handle
        type="target"
        position={Position.Left}
        className="!w-3 !h-3 !bg-purple-500 !border-2 !border-white"
      />

      {/* 헤더 */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500 text-white shadow-md">
            <Sparkles size={16} />
          </div>
          <span className="font-bold text-gray-800 text-sm">
            {data.label || '🔮 스마트 분석'}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <span className="px-1.5 py-0.5 text-[10px] font-bold bg-gradient-to-r from-violet-500 to-pink-500 text-white rounded">
            ALL-IN-ONE
          </span>
          {getStatusIcon()}
        </div>
      </div>

      {/* 기능 설명 */}
      <div className="mb-2 p-2 bg-white/70 rounded-lg">
        <div className="text-xs text-gray-600 space-y-1">
          <div className="flex items-center gap-1">
            <span className="text-purple-500">✓</span> 자연어 이해
          </div>
          <div className="flex items-center gap-1">
            <span className="text-purple-500">✓</span> API 자동 선택
          </div>
          <div className="flex items-center gap-1">
            <span className="text-purple-500">✓</span> AI 분석
          </div>
        </div>
      </div>

      {/* 지원 기능 */}
      <div className="flex flex-wrap gap-1 text-[9px] mb-2">
        <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded-full">재무분석</span>
        <span className="px-1.5 py-0.5 bg-green-100 text-green-700 rounded-full">주식</span>
        <span className="px-1.5 py-0.5 bg-orange-100 text-orange-700 rounded-full">뉴스</span>
        <span className="px-1.5 py-0.5 bg-cyan-100 text-cyan-700 rounded-full">날씨</span>
      </div>

      {/* 결과 미리보기 */}
      {data.result && (
        <div className="mt-2 p-2 bg-purple-50 rounded-lg border border-purple-200">
          <div className="text-[10px] text-purple-700 font-medium mb-1">분석 완료:</div>
          <div className="text-xs text-purple-800 truncate">
            {data.result.slice(0, 80)}...
          </div>
        </div>
      )}

      {/* 출력 핸들 */}
      <Handle
        type="source"
        position={Position.Right}
        className="!w-3 !h-3 !bg-purple-500 !border-2 !border-white"
      />
    </div>
  );
}

export default memo(SmartAnalysisNode);
