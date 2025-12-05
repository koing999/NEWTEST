'use client';

import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Users, Bot, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { MultiAgentNodeData } from '@/types/workflow';
import { useWorkflowStore } from '@/lib/stores/workflow-store';

const agentEmojis: Record<string, string> = {
  'accountant': '🧮',
  'ib': '🏦',
  'mckinsey': '🎯',
  'planner': '📊',
  'jogwajang': '🦥',
};

const agentLabels: Record<string, string> = {
  'accountant': '회계사',
  'ib': 'IB전문가',
  'mckinsey': '맥킨지',
  'planner': '기획자',
  'jogwajang': '조과장',
};

function MultiAgentNode({ id, data, selected }: NodeProps<MultiAgentNodeData>) {
  const { setSelectedNode, nodeResults } = useWorkflowStore();
  const nodeResult = nodeResults[id];

  const getStatusIcon = () => {
    if (!nodeResult) return null;
    switch (nodeResult.status) {
      case 'running':
        return <Loader2 className="w-4 h-4 animate-spin text-blue-500" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  const selectedAgents = data.agents || [];

  return (
    <div
      className={`
        px-4 py-3 rounded-xl shadow-lg border-2 min-w-[280px] max-w-[350px]
        bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50
        ${selected ? 'ring-2 ring-purple-400 border-purple-500' : 'border-purple-300'}
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
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white">
            <Users size={16} />
          </div>
          <span className="font-bold text-gray-800">
            {data.label || '다중 AI 패널'}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {getStatusIcon()}
        </div>
      </div>

      {/* 선택된 에이전트 목록 */}
      <div className="mb-3 flex flex-wrap gap-1">
        {selectedAgents.length === 0 ? (
          <span className="text-xs text-gray-400 italic">에이전트를 선택하세요...</span>
        ) : (
          selectedAgents.map((agent) => (
            <span
              key={agent}
              className="px-2 py-1 text-xs rounded-full bg-white border border-purple-200 text-purple-700 flex items-center gap-1"
            >
              {agentEmojis[agent] || '🤖'} {agentLabels[agent] || agent}
            </span>
          ))
        )}
      </div>

      {/* 분석 모드 */}
      <div className="text-xs text-gray-600 bg-white/60 rounded-md p-2 mb-2">
        <div className="flex items-center gap-2">
          <Bot size={12} />
          <span>분석 모드: {data.analysisMode === 'parallel' ? '병렬 (동시)' : '순차'}</span>
        </div>
        <div className="text-[10px] text-gray-500 mt-1">
          출력: {data.outputFormat === 'combined' ? '통합 리포트' : data.outputFormat === 'separate' ? '개별 탭' : '비교표'}
        </div>
      </div>

      {/* 결과 미리보기 */}
      {data.result && (
        <div className="p-2 bg-green-50 rounded border border-green-200 max-h-24 overflow-y-auto">
          <div className="text-[10px] text-green-700 font-medium mb-1">
            📊 {selectedAgents.length}명 분석 완료
          </div>
          <div className="text-xs text-green-800 truncate">
            {typeof data.result === 'string' 
              ? data.result.slice(0, 100) 
              : JSON.stringify(data.result).slice(0, 100)}...
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

export default memo(MultiAgentNode);
